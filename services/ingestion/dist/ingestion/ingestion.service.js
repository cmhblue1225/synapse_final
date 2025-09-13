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
var IngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const knowledge_node_entity_1 = require("../entities/knowledge-node.entity");
let IngestionService = IngestionService_1 = class IngestionService {
    constructor(knowledgeNodeRepository, dataSource) {
        this.knowledgeNodeRepository = knowledgeNodeRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(IngestionService_1.name);
    }
    async createNode(userId, createDto) {
        this.logger.log(`Creating new knowledge node for user ${userId}: ${createDto.title}`);
        try {
            const existingNode = await this.knowledgeNodeRepository.findOne({
                where: {
                    userId,
                    title: createDto.title,
                    isActive: true,
                },
            });
            if (existingNode) {
                throw new common_1.ConflictException(`Node with title "${createDto.title}" already exists`);
            }
            const newNode = this.knowledgeNodeRepository.create({
                ...createDto,
                userId,
                tags: createDto.tags?.filter(tag => tag.trim().length > 0) || [],
            });
            const savedNode = await this.knowledgeNodeRepository.save(newNode);
            await this.updateSearchVector(savedNode.id);
            this.logger.log(`Successfully created knowledge node ${savedNode.id}`);
            return this.transformToResponseDto(savedNode);
        }
        catch (error) {
            this.logger.error(`Failed to create knowledge node: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getNode(userId, nodeId) {
        this.logger.log(`Retrieving knowledge node ${nodeId} for user ${userId}`);
        const node = await this.knowledgeNodeRepository.findOne({
            where: {
                id: nodeId,
                userId,
                isActive: true,
            },
        });
        if (!node) {
            throw new common_1.NotFoundException(`Knowledge node ${nodeId} not found`);
        }
        return this.transformToResponseDto(node);
    }
    async updateNode(userId, nodeId, updateDto) {
        this.logger.log(`Updating knowledge node ${nodeId} for user ${userId}`);
        const existingNode = await this.knowledgeNodeRepository.findOne({
            where: {
                id: nodeId,
                userId,
                isActive: true,
            },
        });
        if (!existingNode) {
            throw new common_1.NotFoundException(`Knowledge node ${nodeId} not found`);
        }
        if (updateDto.title && updateDto.title !== existingNode.title) {
            const duplicateNode = await this.knowledgeNodeRepository.findOne({
                where: {
                    userId,
                    title: updateDto.title,
                    isActive: true,
                },
            });
            if (duplicateNode && duplicateNode.id !== nodeId) {
                throw new common_1.ConflictException(`Node with title "${updateDto.title}" already exists`);
            }
        }
        try {
            const updatedData = {
                ...updateDto,
                version: existingNode.version + 1,
                tags: updateDto.tags?.filter(tag => tag.trim().length > 0) || existingNode.tags,
            };
            await this.knowledgeNodeRepository.update(nodeId, updatedData);
            if (updateDto.title || updateDto.content) {
                await this.updateSearchVector(nodeId);
            }
            const updatedNode = await this.knowledgeNodeRepository.findOne({
                where: { id: nodeId },
            });
            this.logger.log(`Successfully updated knowledge node ${nodeId}`);
            return this.transformToResponseDto(updatedNode);
        }
        catch (error) {
            this.logger.error(`Failed to update knowledge node ${nodeId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteNode(userId, nodeId) {
        this.logger.log(`Deleting knowledge node ${nodeId} for user ${userId}`);
        const existingNode = await this.knowledgeNodeRepository.findOne({
            where: {
                id: nodeId,
                userId,
                isActive: true,
            },
        });
        if (!existingNode) {
            throw new common_1.NotFoundException(`Knowledge node ${nodeId} not found`);
        }
        try {
            await this.knowledgeNodeRepository.update(nodeId, {
                isActive: false,
                version: existingNode.version + 1,
            });
            this.logger.log(`Successfully deleted knowledge node ${nodeId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete knowledge node ${nodeId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getUserNodes(userId, options = {}) {
        this.logger.log(`Retrieving knowledge nodes for user ${userId}`);
        const { limit = 50, offset = 0, nodeType, contentType, sortBy = 'updatedAt', sortOrder = 'DESC', } = options;
        try {
            const queryBuilder = this.knowledgeNodeRepository
                .createQueryBuilder('node')
                .where('node.userId = :userId', { userId })
                .andWhere('node.isActive = true');
            if (nodeType) {
                queryBuilder.andWhere('node.nodeType = :nodeType', { nodeType });
            }
            if (contentType) {
                queryBuilder.andWhere('node.contentType = :contentType', { contentType });
            }
            queryBuilder.orderBy(`node.${sortBy}`, sortOrder);
            queryBuilder.limit(limit).offset(offset);
            const [nodes, total] = await queryBuilder.getManyAndCount();
            const responseNodes = nodes.map(node => this.transformToResponseDto(node));
            return { nodes: responseNodes, total };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve user nodes: ${error.message}`, error.stack);
            throw error;
        }
    }
    async bulkCreateNodes(userId, bulkCreateDto) {
        this.logger.log(`Bulk creating ${bulkCreateDto.nodes.length} knowledge nodes for user ${userId}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const createdNodes = [];
            for (const nodeDto of bulkCreateDto.nodes) {
                const existingNode = await queryRunner.manager.findOne(knowledge_node_entity_1.KnowledgeNodeEntity, {
                    where: {
                        userId,
                        title: nodeDto.title,
                        isActive: true,
                    },
                });
                if (existingNode) {
                    this.logger.warn(`Skipping duplicate node: ${nodeDto.title}`);
                    continue;
                }
                const newNode = queryRunner.manager.create(knowledge_node_entity_1.KnowledgeNodeEntity, {
                    ...nodeDto,
                    userId,
                    tags: nodeDto.tags?.filter(tag => tag.trim().length > 0) || [],
                });
                const savedNode = await queryRunner.manager.save(newNode);
                createdNodes.push(savedNode);
            }
            await queryRunner.commitTransaction();
            for (const node of createdNodes) {
                await this.updateSearchVector(node.id);
            }
            this.logger.log(`Successfully bulk created ${createdNodes.length} knowledge nodes`);
            return createdNodes.map(node => this.transformToResponseDto(node));
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to bulk create knowledge nodes: ${error.message}`, error.stack);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async linkNodes(userId, sourceNodeId, targetNodeId, relationshipType, weight = 1.0, metadata) {
        this.logger.log(`Creating relationship between nodes ${sourceNodeId} -> ${targetNodeId}`);
        const [sourceNode, targetNode] = await Promise.all([
            this.knowledgeNodeRepository.findOne({
                where: { id: sourceNodeId, userId, isActive: true },
            }),
            this.knowledgeNodeRepository.findOne({
                where: { id: targetNodeId, userId, isActive: true },
            }),
        ]);
        if (!sourceNode) {
            throw new common_1.NotFoundException(`Source node ${sourceNodeId} not found`);
        }
        if (!targetNode) {
            throw new common_1.NotFoundException(`Target node ${targetNodeId} not found`);
        }
        try {
            const existingRelations = sourceNode.relatedNodes || [];
            const relationIndex = existingRelations.findIndex(rel => rel.id === targetNodeId);
            const newRelation = {
                id: targetNodeId,
                relationshipType,
                weight: Math.max(0, Math.min(1, weight)),
                metadata: metadata || {},
            };
            if (relationIndex >= 0) {
                existingRelations[relationIndex] = newRelation;
            }
            else {
                existingRelations.push(newRelation);
            }
            await this.knowledgeNodeRepository.update(sourceNodeId, {
                relatedNodes: existingRelations,
                version: sourceNode.version + 1,
            });
            this.logger.log(`Successfully linked nodes ${sourceNodeId} -> ${targetNodeId}`);
        }
        catch (error) {
            this.logger.error(`Failed to link nodes: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateSearchVector(nodeId) {
        try {
            await this.knowledgeNodeRepository.query(`UPDATE knowledge_nodes 
         SET search_vector = to_tsvector('korean', title || ' ' || content)
         WHERE id = $1`, [nodeId]);
        }
        catch (error) {
            this.logger.warn(`Failed to update search vector for node ${nodeId}: ${error.message}`);
        }
    }
    transformToResponseDto(node) {
        return {
            id: node.id,
            title: node.title,
            content: node.content,
            contentType: node.contentType,
            nodeType: node.nodeType,
            userId: node.userId,
            tags: node.tags || [],
            metadata: node.metadata || {},
            relatedNodes: node.relatedNodes || [],
            version: node.version,
            isActive: node.isActive,
            createdAt: node.createdAt,
            updatedAt: node.updatedAt,
        };
    }
    async getNodeStats(userId) {
        this.logger.log(`Getting node statistics for user ${userId}`);
        try {
            const stats = await this.knowledgeNodeRepository
                .createQueryBuilder('node')
                .select([
                'COUNT(*) as total_nodes',
                'COUNT(CASE WHEN node.nodeType = :knowledge THEN 1 END) as knowledge_count',
                'COUNT(CASE WHEN node.nodeType = :concept THEN 1 END) as concept_count',
                'COUNT(CASE WHEN node.nodeType = :fact THEN 1 END) as fact_count',
                'COUNT(CASE WHEN node.contentType = :text THEN 1 END) as text_count',
                'COUNT(CASE WHEN node.contentType = :document THEN 1 END) as document_count',
            ])
                .where('node.userId = :userId', { userId })
                .andWhere('node.isActive = true')
                .setParameters({
                knowledge: 'Knowledge',
                concept: 'Concept',
                fact: 'Fact',
                text: 'text',
                document: 'document',
            })
                .getRawOne();
            return {
                totalNodes: parseInt(stats.total_nodes),
                nodeTypeDistribution: {
                    Knowledge: parseInt(stats.knowledge_count),
                    Concept: parseInt(stats.concept_count),
                    Fact: parseInt(stats.fact_count),
                },
                contentTypeDistribution: {
                    text: parseInt(stats.text_count),
                    document: parseInt(stats.document_count),
                }
            };
        }
        catch (error) {
            this.logger.error(`Failed to get node statistics: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.IngestionService = IngestionService;
exports.IngestionService = IngestionService = IngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(knowledge_node_entity_1.KnowledgeNodeEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], IngestionService);
//# sourceMappingURL=ingestion.service.js.map