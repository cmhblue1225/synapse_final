import { Repository, DataSource } from 'typeorm';
import { KnowledgeNodeEntity } from '../entities/knowledge-node.entity';
import { CreateKnowledgeNodeDto, UpdateKnowledgeNodeDto, KnowledgeNodeResponseDto, BulkCreateKnowledgeNodeDto } from '../dto/ingestion.dto';
export declare class IngestionService {
    private readonly knowledgeNodeRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(knowledgeNodeRepository: Repository<KnowledgeNodeEntity>, dataSource: DataSource);
    createNode(userId: string, createDto: CreateKnowledgeNodeDto): Promise<KnowledgeNodeResponseDto>;
    getNode(userId: string, nodeId: string): Promise<KnowledgeNodeResponseDto>;
    updateNode(userId: string, nodeId: string, updateDto: UpdateKnowledgeNodeDto): Promise<KnowledgeNodeResponseDto>;
    deleteNode(userId: string, nodeId: string): Promise<void>;
    getUserNodes(userId: string, options?: {
        limit?: number;
        offset?: number;
        nodeType?: string;
        contentType?: string;
        sortBy?: 'createdAt' | 'updatedAt' | 'title';
        sortOrder?: 'ASC' | 'DESC';
    }): Promise<{
        nodes: KnowledgeNodeResponseDto[];
        total: number;
    }>;
    bulkCreateNodes(userId: string, bulkCreateDto: BulkCreateKnowledgeNodeDto): Promise<KnowledgeNodeResponseDto[]>;
    linkNodes(userId: string, sourceNodeId: string, targetNodeId: string, relationshipType: string, weight?: number, metadata?: Record<string, any>): Promise<void>;
    private updateSearchVector;
    private transformToResponseDto;
    getNodeStats(userId: string): Promise<any>;
}
