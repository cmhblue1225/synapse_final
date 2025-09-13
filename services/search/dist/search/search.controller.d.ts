import { SearchService } from './search.service';
import { SearchQueryDto, AutocompleteQueryDto, SearchResponseDto } from '../dto/search.dto';
export declare class SearchController {
    private readonly searchService;
    private readonly logger;
    constructor(searchService: SearchService);
    search(searchQuery: SearchQueryDto, userId?: string): Promise<SearchResponseDto>;
    autocomplete(query: AutocompleteQueryDto, userId?: string): Promise<{
        suggestions: string[];
    }>;
    getPopularTags(limit?: number, userId?: string): Promise<{
        tags: Array<{
            tag: string;
            count: number;
        }>;
    }>;
    getSearchStats(userId?: string): Promise<any>;
    health(): Promise<any>;
}
