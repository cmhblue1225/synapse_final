import { IngestionService } from './ingestion.service';
import { CreateKnowledgeNodeDto, UpdateKnowledgeNodeDto, KnowledgeNodeResponseDto, BulkCreateKnowledgeNodeDto, FileUploadDto } from '../dto/ingestion.dto';
export declare class IngestionController {
    private readonly ingestionService;
    private readonly logger;
    constructor(ingestionService: IngestionService);
    createNode(createDto: CreateKnowledgeNodeDto, userId?: string): Promise<KnowledgeNodeResponseDto>;
    getNode(nodeId: string, userId?: string): Promise<KnowledgeNodeResponseDto>;
    updateNode(nodeId: string, updateDto: UpdateKnowledgeNodeDto, userId?: string): Promise<KnowledgeNodeResponseDto>;
    deleteNode(nodeId: string, userId?: string): Promise<void>;
    getUserNodes(limit?: number, offset?: number, nodeType?: string, contentType?: string, sortBy?: 'createdAt' | 'updatedAt' | 'title', sortOrder?: 'ASC' | 'DESC', userId?: string): Promise<{
        nodes: KnowledgeNodeResponseDto[];
        total: number;
    }>;
    bulkCreateNodes(bulkCreateDto: BulkCreateKnowledgeNodeDto, userId?: string): Promise<KnowledgeNodeResponseDto[]>;
    linkNodes(sourceId: string, targetId: string, linkData: {
        relationshipType: string;
        weight?: number;
        metadata?: Record<string, any>;
    }, userId?: string): Promise<void>;
    getStats(userId?: string): Promise<any>;
    uploadFile(file: Express.Multer.File, uploadDto: FileUploadDto, userId?: string): Promise<KnowledgeNodeResponseDto[]>;
    health(): Promise<any>;
}
