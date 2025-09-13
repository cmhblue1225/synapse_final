import { Repository } from 'typeorm';
import { KnowledgeNodeEntity } from '../entities/knowledge-node.entity';
import { SearchQueryDto, AutocompleteQueryDto, SearchResponseDto } from '../dto/search.dto';
export declare class SearchService {
    private readonly knowledgeNodeRepository;
    private readonly logger;
    constructor(knowledgeNodeRepository: Repository<KnowledgeNodeEntity>);
    search(userId: string, searchQuery: SearchQueryDto): Promise<SearchResponseDto>;
    autocomplete(userId: string, query: AutocompleteQueryDto): Promise<string[]>;
    getPopularTags(userId: string, limit?: number): Promise<Array<{
        tag: string;
        count: number;
    }>>;
    getSearchStats(userId: string): Promise<any>;
    private createBaseQuery;
    private applySorting;
    private transformToSearchResults;
    private generateHighlights;
    private getAppliedFilters;
}
