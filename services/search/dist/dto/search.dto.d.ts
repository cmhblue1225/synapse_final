import { NodeType, ContentType } from '../entities/knowledge-node.entity';
export declare class SearchQueryDto {
    query: string;
    nodeTypes?: NodeType[];
    contentTypes?: ContentType[];
    tags?: string[];
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: 'relevance' | 'date' | 'title';
    sortOrder?: 'asc' | 'desc';
}
export declare class AutocompleteQueryDto {
    query: string;
    limit?: number;
}
export declare class SearchResultDto {
    id: string;
    title: string;
    content: string;
    contentType: ContentType;
    nodeType: NodeType;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    relevanceScore: number;
    highlights: string[];
}
export declare class SearchResponseDto {
    results: SearchResultDto[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    searchTime: number;
    appliedFilters: Record<string, any>;
}
