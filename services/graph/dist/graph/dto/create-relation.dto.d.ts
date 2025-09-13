import { SemanticRelationType } from '../../types/semantic-types';
export declare class CreateRelationDto {
    fromNodeId: string;
    toNodeId: string;
    relationType: SemanticRelationType;
    strength?: number;
    confidence?: number;
    metadata?: Record<string, any>;
}
