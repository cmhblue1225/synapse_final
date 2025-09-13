import { NodeType, ContentType } from '../entities/knowledge-node.entity';
export declare class CreateKnowledgeNodeDto {
    title: string;
    content: string;
    contentType?: ContentType;
    nodeType?: NodeType;
    tags?: string[];
    metadata?: Record<string, any>;
    relatedNodes?: Array<{
        id: string;
        relationshipType: string;
        weight: number;
        metadata?: Record<string, any>;
    }>;
}
declare const UpdateKnowledgeNodeDto_base: import("@nestjs/common").Type<Partial<CreateKnowledgeNodeDto>>;
export declare class UpdateKnowledgeNodeDto extends UpdateKnowledgeNodeDto_base {
    isActive?: boolean;
}
export declare class KnowledgeNodeResponseDto {
    id: string;
    title: string;
    content: string;
    contentType: ContentType;
    nodeType: NodeType;
    userId: string;
    tags: string[];
    metadata: Record<string, any>;
    relatedNodes: Array<{
        id: string;
        relationshipType: string;
        weight: number;
        metadata?: Record<string, any>;
    }>;
    version: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BulkCreateKnowledgeNodeDto {
    nodes: CreateKnowledgeNodeDto[];
}
export declare class FileUploadDto {
    fileType: string;
    parseOptions?: {
        extractImages?: boolean;
        splitByHeaders?: boolean;
        maxNodeLength?: number;
        defaultTags?: string[];
        defaultNodeType?: NodeType;
    };
}
export {};
