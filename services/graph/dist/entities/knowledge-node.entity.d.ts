import { NodeType, ContentType } from '../types/semantic-types';
export declare class KnowledgeNodeEntity {
    id: string;
    title: string;
    content: string;
    contentType: ContentType;
    nodeType: NodeType;
    userId: string;
    metadata: Record<string, any>;
    tags: string[];
    version: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    searchVector?: string;
}
