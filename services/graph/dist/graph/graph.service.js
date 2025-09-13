"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var GraphService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const neo4j_service_1 = require("../neo4j/neo4j.service");
const knowledge_node_entity_1 = require("../entities/knowledge-node.entity");
const semantic_relation_entity_1 = require("../entities/semantic-relation.entity");
let GraphService = GraphService_1 = class GraphService {
    constructor(nodeRepository, relationRepository, neo4jService) {
        this.nodeRepository = nodeRepository;
        this.relationRepository = relationRepository;
        this.neo4jService = neo4jService;
        this.logger = new common_1.Logger(GraphService_1.name);
    }
    async createNode(nodeData) {
        this.logger.log(`Creating node: ${nodeData.title}`);
        const nodeEntity = this.nodeRepository.create(nodeData);
        const savedNode = await this.nodeRepository.save(nodeEntity);
        await this.syncNodeToNeo4j(savedNode);
        return this.entityToNode(savedNode);
    }
    async updateNode(id, updateData) {
        const node = await this.nodeRepository.findOne({ where: { id, isActive: true } });
        if (!node) {
            throw new common_1.NotFoundException(`Node with id ${id} not found`);
        }
        updateData.version = node.version + 1;
        await this.nodeRepository.update(id, updateData);
        const updatedNode = await this.nodeRepository.findOne({ where: { id } });
        await this.syncNodeToNeo4j(updatedNode);
        return this.entityToNode(updatedNode);
    }
    async deleteNode(id) {
        const node = await this.nodeRepository.findOne({ where: { id, isActive: true } });
        if (!node) {
            throw new common_1.NotFoundException(`Node with id ${id} not found`);
        }
        await this.nodeRepository.update(id, { isActive: false });
        await this.relationRepository.update([{ fromNodeId: id }, { toNodeId: id }], { isActive: false });
        await this.neo4jService.runQuery('MATCH (n {id: $id}) DETACH DELETE n', { id });
        this.logger.log(`Deleted node: ${id}`);
    }
    async getNode(id) {
        const node = await this.nodeRepository.findOne({
            where: { id, isActive: true }
        });
        if (!node) {
            throw new common_1.NotFoundException(`Node with id ${id} not found`);
        }
        return this.entityToNode(node);
    }
    async createRelation(relationData) {
        this.logger.log(`Creating relation: ${relationData.fromNodeId} -> ${relationData.toNodeId}`);
        const fromNode = await this.nodeRepository.findOne({
            where: { id: relationData.fromNodeId, isActive: true }
        });
        const toNode = await this.nodeRepository.findOne({
            where: { id: relationData.toNodeId, isActive: true }
        });
        if (!fromNode || !toNode) {
            throw new common_1.BadRequestException('One or both nodes do not exist');
        }
        const existingRelation = await this.relationRepository.findOne({
            where: {
                fromNodeId: relationData.fromNodeId,
                toNodeId: relationData.toNodeId,
                relationType: relationData.relationType,
                isActive: true,
            },
        });
        if (existingRelation) {
            throw new common_1.BadRequestException('Relation already exists');
        }
        const relationEntity = this.relationRepository.create(relationData);
        const savedRelation = await this.relationRepository.save(relationEntity);
        await this.syncRelationToNeo4j(savedRelation, fromNode, toNode);
        return this.entityToRelation(savedRelation);
    }
    async updateRelation(id, updateData) {
        const relation = await this.relationRepository.findOne({
            where: { id, isActive: true }
        });
        if (!relation) {
            throw new common_1.NotFoundException(`Relation with id ${id} not found`);
        }
        const updateObj = { ...updateData, version: relation.version + 1 };
        await this.relationRepository.update(id, updateObj);
        const updatedRelation = await this.relationRepository.findOne({ where: { id } });
        await this.neo4jService.runQuery(`
      MATCH (from {id: $fromId})-[r:${relation.relationType}]->(to {id: $toId})
      SET r += $properties
    `, {
            fromId: relation.fromNodeId,
            toId: relation.toNodeId,
            properties: {
                strength: updatedRelation.strength,
                confidence: updatedRelation.confidence,
                metadata: updatedRelation.metadata,
                updatedAt: updatedRelation.updatedAt.toISOString(),
            },
        });
        return this.entityToRelation(updatedRelation);
    }
    async deleteRelation(id) {
        const relation = await this.relationRepository.findOne({
            where: { id, isActive: true }
        });
        if (!relation) {
            throw new common_1.NotFoundException(`Relation with id ${id} not found`);
        }
        await this.relationRepository.update(id, { isActive: false });
        await this.neo4jService.runQuery(`
      MATCH (from {id: $fromId})-[r:${relation.relationType}]->(to {id: $toId})
      DELETE r
    `, {
            fromId: relation.fromNodeId,
            toId: relation.toNodeId,
        });
        this.logger.log(`Deleted relation: ${id}`);
    }
    async searchNodes(query, userId, limit = 20, offset = 0) {
        const startTime = Date.now();
        const [nodes, totalCount] = await this.nodeRepository.findAndCount({
            where: {
                userId,
                isActive: true,
            },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
        const nodeIds = nodes.map(n => n.id);
        const relations = await this.relationRepository.find({
            where: [
                { fromNodeId: nodeIds, isActive: true },
                { toNodeId: nodeIds, isActive: true },
            ],
        });
        const searchTime = Date.now() - startTime;
        return {
            nodes: nodes.map(n => this.entityToNode(n)),
            relations: relations.map(r => this.entityToRelation(r)),
            totalCount,
            searchTime,
        };
    }
    async findPath(fromNodeId, toNodeId, maxDepth = 6) {
        const result = await this.neo4jService.runQuery(`
      MATCH path = shortestPath((from {id: $fromId})-[*1..${maxDepth}]-(to {id: $toId}))
      WITH path, relationships(path) as rels, nodes(path) as nodes
      RETURN path,
             nodes,
             rels,
             reduce(totalDistance = 0, r in rels | totalDistance + (1 - r.strength)) as totalDistance,
             reduce(pathStrength = 1, r in rels | pathStrength * r.strength) as pathStrength
      ORDER BY totalDistance ASC
      LIMIT 5
    `, {
            fromId: fromNodeId,
            toId: toNodeId,
        });
        return result.records.map(record => ({
            path: [],
            totalDistance: record.get('totalDistance'),
            pathStrength: record.get('pathStrength'),
        }));
    }
    async getGraphStats(userId) {
        const totalNodes = await this.nodeRepository.count({
            where: { userId, isActive: true }
        });
        const totalRelations = await this.relationRepository.count({
            where: { userId, isActive: true }
        });
        const connectivityResult = await this.neo4jService.runQuery(`
      MATCH (n {userId: $userId})
      WITH n, size((n)-[]->()) + size((n)<-[]-()) as connections
      RETURN avg(connections) as avgConnections,
             collect({nodeId: n.id, title: n.title, connections: connections}) as nodeStats
      ORDER BY connections DESC
      LIMIT 10
    `, { userId });
        const record = connectivityResult.records[0];
        const avgConnections = record?.get('avgConnections') || 0;
        const mostConnectedNodes = record?.get('nodeStats') || [];
        return {
            totalNodes,
            totalRelations,
            nodesByType: {},
            relationsByType: {},
            avgConnectionsPerNode: avgConnections,
            mostConnectedNodes: mostConnectedNodes.slice(0, 5),
        };
    }
    async syncNodeToNeo4j(node) {
        await this.neo4jService.runQuery(`
      MERGE (n:Node {id: $id})
      SET n += $properties
      SET n:${node.nodeType}
    `, {
            id: node.id,
            properties: {
                title: node.title,
                content: node.content,
                nodeType: node.nodeType,
                contentType: node.contentType,
                userId: node.userId,
                metadata: node.metadata,
                tags: node.tags,
                createdAt: node.createdAt.toISOString(),
                updatedAt: node.updatedAt.toISOString(),
            },
        });
    }
    async syncRelationToNeo4j(relation, fromNode, toNode) {
        await this.neo4jService.runQuery(`
      MATCH (from:Node {id: $fromId}), (to:Node {id: $toId})
      MERGE (from)-[r:${relation.relationType}]->(to)
      SET r += $properties
    `, {
            fromId: fromNode.id,
            toId: toNode.id,
            properties: {
                id: relation.id,
                strength: relation.strength,
                confidence: relation.confidence,
                metadata: relation.metadata,
                userId: relation.userId,
                createdAt: relation.createdAt.toISOString(),
            },
        });
    }
    entityToNode(entity) {
        return {
            id: entity.id,
            title: entity.title,
            content: entity.content,
            contentType: entity.contentType,
            nodeType: entity.nodeType,
            userId: entity.userId,
            metadata: entity.metadata,
            tags: entity.tags,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            version: entity.version,
        };
    }
    entityToRelation(entity) {
        return {
            id: entity.id,
            fromNodeId: entity.fromNodeId,
            toNodeId: entity.toNodeId,
            relationType: entity.relationType,
            strength: Number(entity.strength),
            confidence: Number(entity.confidence),
            metadata: entity.metadata,
            userId: entity.userId,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
};
exports.GraphService = GraphService;
exports.GraphService = GraphService = GraphService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(knowledge_node_entity_1.KnowledgeNodeEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(semantic_relation_entity_1.SemanticRelationEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        neo4j_service_1.Neo4jService])
], GraphService);
//# sourceMappingURL=graph.service.js.map