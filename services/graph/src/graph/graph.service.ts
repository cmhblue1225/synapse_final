import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Neo4jService } from '../neo4j/neo4j.service';
import { KnowledgeNodeEntity } from '../entities/knowledge-node.entity';
import { SemanticRelationEntity } from '../entities/semantic-relation.entity';
import { 
  KnowledgeNode, 
  SemanticRelation, 
  SemanticRelationType,
  NodeType,
  SearchResult,
  GraphStats,
  PathResult,
  ClusterResult
} from '../types/semantic-types';

@Injectable()
export class GraphService {
  private readonly logger = new Logger(GraphService.name);

  constructor(
    @InjectRepository(KnowledgeNodeEntity)
    private readonly nodeRepository: Repository<KnowledgeNodeEntity>,
    @InjectRepository(SemanticRelationEntity)
    private readonly relationRepository: Repository<SemanticRelationEntity>,
    private readonly neo4jService: Neo4jService,
  ) {}

  // === 노드 관리 ===
  async createNode(nodeData: Partial<KnowledgeNode>): Promise<KnowledgeNode> {
    this.logger.log(`Creating node: ${nodeData.title}`);

    // PostgreSQL에 노드 저장
    const nodeEntity = this.nodeRepository.create(nodeData);
    const savedNode = await this.nodeRepository.save(nodeEntity);

    // Neo4j에 노드 동기화
    await this.syncNodeToNeo4j(savedNode);

    return this.entityToNode(savedNode);
  }

  async updateNode(id: string, updateData: Partial<KnowledgeNode>): Promise<KnowledgeNode> {
    const node = await this.nodeRepository.findOne({ where: { id, isActive: true } });
    if (!node) {
      throw new NotFoundException(`Node with id ${id} not found`);
    }

    // 버전 증가
    updateData.version = node.version + 1;
    
    await this.nodeRepository.update(id, updateData);
    const updatedNode = await this.nodeRepository.findOne({ where: { id } });

    // Neo4j 동기화
    await this.syncNodeToNeo4j(updatedNode);

    return this.entityToNode(updatedNode);
  }

  async deleteNode(id: string): Promise<void> {
    const node = await this.nodeRepository.findOne({ where: { id, isActive: true } });
    if (!node) {
      throw new NotFoundException(`Node with id ${id} not found`);
    }

    // 소프트 삭제
    await this.nodeRepository.update(id, { isActive: false });
    
    // 관련 관계들도 비활성화
    await this.relationRepository.update(
      [{ fromNodeId: id }, { toNodeId: id }],
      { isActive: false }
    );

    // Neo4j에서 삭제
    await this.neo4jService.runQuery(
      'MATCH (n {id: $id}) DETACH DELETE n',
      { id }
    );

    this.logger.log(`Deleted node: ${id}`);
  }

  async getNode(id: string): Promise<KnowledgeNode> {
    const node = await this.nodeRepository.findOne({ 
      where: { id, isActive: true } 
    });
    
    if (!node) {
      throw new NotFoundException(`Node with id ${id} not found`);
    }

    return this.entityToNode(node);
  }

  // === 관계 관리 ===
  async createRelation(relationData: Partial<SemanticRelation>): Promise<SemanticRelation> {
    this.logger.log(`Creating relation: ${relationData.fromNodeId} -> ${relationData.toNodeId}`);

    // 노드 존재 확인
    const fromNode = await this.nodeRepository.findOne({ 
      where: { id: relationData.fromNodeId, isActive: true } 
    });
    const toNode = await this.nodeRepository.findOne({ 
      where: { id: relationData.toNodeId, isActive: true } 
    });

    if (!fromNode || !toNode) {
      throw new BadRequestException('One or both nodes do not exist');
    }

    // 중복 관계 확인
    const existingRelation = await this.relationRepository.findOne({
      where: {
        fromNodeId: relationData.fromNodeId,
        toNodeId: relationData.toNodeId,
        relationType: relationData.relationType,
        isActive: true,
      },
    });

    if (existingRelation) {
      throw new BadRequestException('Relation already exists');
    }

    // PostgreSQL에 관계 저장
    const relationEntity = this.relationRepository.create(relationData);
    const savedRelation = await this.relationRepository.save(relationEntity);

    // Neo4j에 관계 동기화
    await this.syncRelationToNeo4j(savedRelation, fromNode, toNode);

    return this.entityToRelation(savedRelation);
  }

  async updateRelation(id: string, updateData: Partial<SemanticRelation>): Promise<SemanticRelation> {
    const relation = await this.relationRepository.findOne({ 
      where: { id, isActive: true } 
    });
    
    if (!relation) {
      throw new NotFoundException(`Relation with id ${id} not found`);
    }

    const updateObj = { ...updateData, version: relation.version + 1 };
    await this.relationRepository.update(id, updateObj);
    const updatedRelation = await this.relationRepository.findOne({ where: { id } });

    // Neo4j 동기화 (관계 업데이트)
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

  async deleteRelation(id: string): Promise<void> {
    const relation = await this.relationRepository.findOne({ 
      where: { id, isActive: true } 
    });
    
    if (!relation) {
      throw new NotFoundException(`Relation with id ${id} not found`);
    }

    // 소프트 삭제
    await this.relationRepository.update(id, { isActive: false });

    // Neo4j에서 삭제
    await this.neo4jService.runQuery(`
      MATCH (from {id: $fromId})-[r:${relation.relationType}]->(to {id: $toId})
      DELETE r
    `, {
      fromId: relation.fromNodeId,
      toId: relation.toNodeId,
    });

    this.logger.log(`Deleted relation: ${id}`);
  }

  // === 검색 및 탐색 ===
  async searchNodes(
    query: string,
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResult> {
    const startTime = Date.now();

    // PostgreSQL에서 텍스트 검색
    const [nodes, totalCount] = await this.nodeRepository.findAndCount({
      where: {
        userId,
        isActive: true,
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    // 연관 관계들 가져오기
    const nodeIds = nodes.map(n => n.id);
    const relations = await this.relationRepository.find({
      where: [
        { fromNodeId: nodeIds as any, isActive: true },
        { toNodeId: nodeIds as any, isActive: true },
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

  async findPath(
    fromNodeId: string,
    toNodeId: string,
    maxDepth: number = 6
  ): Promise<PathResult[]> {
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

    // 결과 변환은 복잡하므로 여기서는 간단히 처리
    return result.records.map(record => ({
      path: [], // 실제 구현에서는 노드와 관계 정보를 파싱
      totalDistance: record.get('totalDistance'),
      pathStrength: record.get('pathStrength'),
    }));
  }

  async getGraphStats(userId: string): Promise<GraphStats> {
    const totalNodes = await this.nodeRepository.count({ 
      where: { userId, isActive: true } 
    });
    
    const totalRelations = await this.relationRepository.count({ 
      where: { userId, isActive: true } 
    });

    // Neo4j에서 연결성 통계
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
      nodesByType: {} as Record<NodeType, number>, // 실제 구현에서는 GROUP BY로 계산
      relationsByType: {} as Record<SemanticRelationType, number>, // 실제 구현에서는 GROUP BY로 계산
      avgConnectionsPerNode: avgConnections,
      mostConnectedNodes: mostConnectedNodes.slice(0, 5),
    };
  }

  // === Neo4j 동기화 ===
  private async syncNodeToNeo4j(node: KnowledgeNodeEntity): Promise<void> {
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

  private async syncRelationToNeo4j(
    relation: SemanticRelationEntity,
    fromNode: KnowledgeNodeEntity,
    toNode: KnowledgeNodeEntity
  ): Promise<void> {
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

  // === 유틸리티 메서드 ===
  private entityToNode(entity: KnowledgeNodeEntity): KnowledgeNode {
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

  private entityToRelation(entity: SemanticRelationEntity): SemanticRelation {
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
}