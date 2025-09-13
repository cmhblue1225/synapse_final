import { SemanticRelationType } from '../types/semantic-types';
export declare class SemanticRelationEntity {
    id: string;
    fromNodeId: string;
    toNodeId: string;
    relationType: SemanticRelationType;
    strength: number;
    confidence: number;
    metadata: Record<string, any>;
    userId: string;
    isActive: boolean;
    isSystemGenerated: boolean;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    checksum?: string;
    isBidirectional: boolean;
}
