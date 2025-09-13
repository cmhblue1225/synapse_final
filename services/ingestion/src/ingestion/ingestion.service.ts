import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, DataSource } from 'typeorm';
import { KnowledgeNodeEntity } from '../entities/knowledge-node.entity';
import { 
  CreateKnowledgeNodeDto, 
  UpdateKnowledgeNodeDto, 
  KnowledgeNodeResponseDto,
  BulkCreateKnowledgeNodeDto 
} from '../dto/ingestion.dto';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectRepository(KnowledgeNodeEntity)
    private readonly knowledgeNodeRepository: Repository<KnowledgeNodeEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createNode(userId: string, createDto: CreateKnowledgeNodeDto): Promise<KnowledgeNodeResponseDto> {
    this.logger.log(`Creating new knowledge node for user ${userId}: ${createDto.title}`);

    try {
      // 중복 제목 확인 (같은 사용자의 활성 노드 중에서)
      const existingNode = await this.knowledgeNodeRepository.findOne({
        where: {
          userId,
          title: createDto.title,
          isActive: true,
        },
      });

      if (existingNode) {
        throw new ConflictException(`Node with title "${createDto.title}" already exists`);
      }

      // 새 노드 생성
      const newNode = this.knowledgeNodeRepository.create({
        ...createDto,
        userId,
        tags: createDto.tags?.filter(tag => tag.trim().length > 0) || [],
      });

      const savedNode = await this.knowledgeNodeRepository.save(newNode);
      
      // 검색 벡터 업데이트 (PostgreSQL 트리거에서 자동 처리)
      await this.updateSearchVector(savedNode.id);

      this.logger.log(`Successfully created knowledge node ${savedNode.id}`);
      return this.transformToResponseDto(savedNode);

    } catch (error) {
      this.logger.error(`Failed to create knowledge node: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getNode(userId: string, nodeId: string): Promise<KnowledgeNodeResponseDto> {
    this.logger.log(`Retrieving knowledge node ${nodeId} for user ${userId}`);

    const node = await this.knowledgeNodeRepository.findOne({
      where: {
        id: nodeId,
        userId,
        isActive: true,
      },
    });

    if (!node) {
      throw new NotFoundException(`Knowledge node ${nodeId} not found`);
    }

    return this.transformToResponseDto(node);
  }

  async updateNode(userId: string, nodeId: string, updateDto: UpdateKnowledgeNodeDto): Promise<KnowledgeNodeResponseDto> {
    this.logger.log(`Updating knowledge node ${nodeId} for user ${userId}`);

    const existingNode = await this.knowledgeNodeRepository.findOne({
      where: {
        id: nodeId,
        userId,
        isActive: true,
      },
    });

    if (!existingNode) {
      throw new NotFoundException(`Knowledge node ${nodeId} not found`);
    }

    // 제목 변경 시 중복 확인
    if (updateDto.title && updateDto.title !== existingNode.title) {
      const duplicateNode = await this.knowledgeNodeRepository.findOne({
        where: {
          userId,
          title: updateDto.title,
          isActive: true,
        },
      });

      if (duplicateNode && duplicateNode.id !== nodeId) {
        throw new ConflictException(`Node with title "${updateDto.title}" already exists`);
      }
    }

    try {
      // 버전 증가
      const updatedData = {
        ...updateDto,
        version: existingNode.version + 1,
        tags: updateDto.tags?.filter(tag => tag.trim().length > 0) || existingNode.tags,
      };

      await this.knowledgeNodeRepository.update(nodeId, updatedData);
      
      // 검색 벡터 업데이트
      if (updateDto.title || updateDto.content) {
        await this.updateSearchVector(nodeId);
      }

      const updatedNode = await this.knowledgeNodeRepository.findOne({
        where: { id: nodeId },
      });

      this.logger.log(`Successfully updated knowledge node ${nodeId}`);
      return this.transformToResponseDto(updatedNode);

    } catch (error) {
      this.logger.error(`Failed to update knowledge node ${nodeId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteNode(userId: string, nodeId: string): Promise<void> {
    this.logger.log(`Deleting knowledge node ${nodeId} for user ${userId}`);

    const existingNode = await this.knowledgeNodeRepository.findOne({
      where: {
        id: nodeId,
        userId,
        isActive: true,
      },
    });

    if (!existingNode) {
      throw new NotFoundException(`Knowledge node ${nodeId} not found`);
    }

    try {
      // 소프트 삭제 (isActive = false)
      await this.knowledgeNodeRepository.update(nodeId, {
        isActive: false,
        version: existingNode.version + 1,
      });

      this.logger.log(`Successfully deleted knowledge node ${nodeId}`);

    } catch (error) {
      this.logger.error(`Failed to delete knowledge node ${nodeId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getUserNodes(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      nodeType?: string;
      contentType?: string;
      sortBy?: 'createdAt' | 'updatedAt' | 'title';
      sortOrder?: 'ASC' | 'DESC';
    } = {}
  ): Promise<{ nodes: KnowledgeNodeResponseDto[]; total: number }> {
    this.logger.log(`Retrieving knowledge nodes for user ${userId}`);

    const {
      limit = 50,
      offset = 0,
      nodeType,
      contentType,
      sortBy = 'updatedAt',
      sortOrder = 'DESC',
    } = options;

    try {
      const queryBuilder = this.knowledgeNodeRepository
        .createQueryBuilder('node')
        .where('node.userId = :userId', { userId })
        .andWhere('node.isActive = true');

      // 필터 적용
      if (nodeType) {
        queryBuilder.andWhere('node.nodeType = :nodeType', { nodeType });
      }

      if (contentType) {
        queryBuilder.andWhere('node.contentType = :contentType', { contentType });
      }

      // 정렬 적용
      queryBuilder.orderBy(`node.${sortBy}`, sortOrder);

      // 페이징 적용
      queryBuilder.limit(limit).offset(offset);

      const [nodes, total] = await queryBuilder.getManyAndCount();

      const responseNodes = nodes.map(node => this.transformToResponseDto(node));

      return { nodes: responseNodes, total };

    } catch (error) {
      this.logger.error(`Failed to retrieve user nodes: ${error.message}`, error.stack);
      throw error;
    }
  }

  async bulkCreateNodes(userId: string, bulkCreateDto: BulkCreateKnowledgeNodeDto): Promise<KnowledgeNodeResponseDto[]> {
    this.logger.log(`Bulk creating ${bulkCreateDto.nodes.length} knowledge nodes for user ${userId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdNodes: KnowledgeNodeEntity[] = [];

      for (const nodeDto of bulkCreateDto.nodes) {
        // 중복 제목 확인
        const existingNode = await queryRunner.manager.findOne(KnowledgeNodeEntity, {
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

        const newNode = queryRunner.manager.create(KnowledgeNodeEntity, {
          ...nodeDto,
          userId,
          tags: nodeDto.tags?.filter(tag => tag.trim().length > 0) || [],
        });

        const savedNode = await queryRunner.manager.save(newNode);
        createdNodes.push(savedNode);
      }

      await queryRunner.commitTransaction();

      // 검색 벡터 업데이트 (트랜잭션 외부에서)
      for (const node of createdNodes) {
        await this.updateSearchVector(node.id);
      }

      this.logger.log(`Successfully bulk created ${createdNodes.length} knowledge nodes`);
      return createdNodes.map(node => this.transformToResponseDto(node));

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to bulk create knowledge nodes: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async linkNodes(
    userId: string,
    sourceNodeId: string,
    targetNodeId: string,
    relationshipType: string,
    weight: number = 1.0,
    metadata?: Record<string, any>
  ): Promise<void> {
    this.logger.log(`Creating relationship between nodes ${sourceNodeId} -> ${targetNodeId}`);

    // 두 노드 모두 존재하고 사용자 소유인지 확인
    const [sourceNode, targetNode] = await Promise.all([
      this.knowledgeNodeRepository.findOne({
        where: { id: sourceNodeId, userId, isActive: true },
      }),
      this.knowledgeNodeRepository.findOne({
        where: { id: targetNodeId, userId, isActive: true },
      }),
    ]);

    if (!sourceNode) {
      throw new NotFoundException(`Source node ${sourceNodeId} not found`);
    }

    if (!targetNode) {
      throw new NotFoundException(`Target node ${targetNodeId} not found`);
    }

    try {
      // 기존 관계 확인 및 업데이트
      const existingRelations = sourceNode.relatedNodes || [];
      const relationIndex = existingRelations.findIndex(rel => rel.id === targetNodeId);

      const newRelation = {
        id: targetNodeId,
        relationshipType,
        weight: Math.max(0, Math.min(1, weight)), // 0-1 범위로 제한
        metadata: metadata || {},
      };

      if (relationIndex >= 0) {
        existingRelations[relationIndex] = newRelation;
      } else {
        existingRelations.push(newRelation);
      }

      await this.knowledgeNodeRepository.update(sourceNodeId, {
        relatedNodes: existingRelations,
        version: sourceNode.version + 1,
      });

      this.logger.log(`Successfully linked nodes ${sourceNodeId} -> ${targetNodeId}`);

    } catch (error) {
      this.logger.error(`Failed to link nodes: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async updateSearchVector(nodeId: string): Promise<void> {
    try {
      // PostgreSQL의 전체 텍스트 검색 벡터 업데이트
      await this.knowledgeNodeRepository.query(
        `UPDATE knowledge_nodes 
         SET search_vector = to_tsvector('korean', title || ' ' || content)
         WHERE id = $1`,
        [nodeId]
      );
    } catch (error) {
      this.logger.warn(`Failed to update search vector for node ${nodeId}: ${error.message}`);
    }
  }

  private transformToResponseDto(node: KnowledgeNodeEntity): KnowledgeNodeResponseDto {
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

  async getNodeStats(userId: string): Promise<any> {
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

    } catch (error) {
      this.logger.error(`Failed to get node statistics: ${error.message}`, error.stack);
      throw error;
    }
  }
}