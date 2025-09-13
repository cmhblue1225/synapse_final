import { NodeType, ContentType } from '../../types/semantic-types';
export declare class CreateNodeDto {
    title: string;
    content: string;
    contentType?: ContentType;
    nodeType?: NodeType;
    metadata?: Record<string, any>;
    tags?: string[];
}
