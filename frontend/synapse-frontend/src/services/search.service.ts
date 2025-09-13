import { searchApi } from './api';
import type { 
  SearchQuery, 
  SearchResponse, 
  AutocompleteQuery, 
  AutocompleteResponse,
  PopularTag,
  NodeStats
} from '../types/api';

export class SearchService {
  // Main search functionality
  async search(query: SearchQuery): Promise<SearchResponse> {
    const params = new URLSearchParams();
    
    // Add query parameters
    if (query.query) params.append('query', query.query);
    if (query.nodeTypes?.length) {
      query.nodeTypes.forEach(type => params.append('nodeTypes', type));
    }
    if (query.contentTypes?.length) {
      query.contentTypes.forEach(type => params.append('contentTypes', type));
    }
    if (query.tags?.length) {
      query.tags.forEach(tag => params.append('tags', tag));
    }
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    return await searchApi.get<SearchResponse>(`/api/search?${params.toString()}`);
  }

  // Autocomplete functionality
  async autocomplete(query: AutocompleteQuery): Promise<AutocompleteResponse> {
    const params = new URLSearchParams();
    params.append('query', query.query);
    if (query.limit) params.append('limit', query.limit.toString());

    return await searchApi.get<AutocompleteResponse>(`/api/search/autocomplete?${params.toString()}`);
  }

  // Popular tags
  async getPopularTags(limit: number = 20): Promise<{ tags: PopularTag[] }> {
    return await searchApi.get<{ tags: PopularTag[] }>(`/api/search/popular-tags?limit=${limit}`);
  }

  // Search statistics
  async getSearchStats(): Promise<NodeStats> {
    return await searchApi.get<NodeStats>('/api/search/stats');
  }

  // Health check
  async checkHealth(): Promise<{ status: string; timestamp: string; service: string; version: string }> {
    return await searchApi.get('/api/search/health');
  }

  // Helper methods for building search queries
  static buildSearchQuery(params: {
    text?: string;
    nodeTypes?: string[];
    contentTypes?: string[];
    tags?: string[];
    dateRange?: { start?: string; end?: string };
    pagination?: { page?: number; limit?: number };
    sorting?: { sortBy?: 'relevance' | 'date' | 'title'; sortOrder?: 'asc' | 'desc' };
  }): SearchQuery {
    return {
      query: params.text || '',
      nodeTypes: params.nodeTypes as any[],
      contentTypes: params.contentTypes as any[],
      tags: params.tags,
      startDate: params.dateRange?.start,
      endDate: params.dateRange?.end,
      page: params.pagination?.page || 1,
      limit: params.pagination?.limit || 10,
      sortBy: params.sorting?.sortBy || 'relevance',
      sortOrder: params.sorting?.sortOrder || 'desc',
    };
  }

  // Advanced search with filters
  async advancedSearch(params: {
    query: string;
    filters?: {
      nodeTypes?: string[];
      contentTypes?: string[];
      tags?: string[];
      dateRange?: { start?: string; end?: string };
    };
    options?: {
      page?: number;
      limit?: number;
      sortBy?: 'relevance' | 'date' | 'title';
      sortOrder?: 'asc' | 'desc';
    };
  }): Promise<SearchResponse> {
    const searchQuery = SearchService.buildSearchQuery({
      text: params.query,
      nodeTypes: params.filters?.nodeTypes,
      contentTypes: params.filters?.contentTypes,
      tags: params.filters?.tags,
      dateRange: params.filters?.dateRange,
      pagination: params.options,
      sorting: params.options,
    });

    return await this.search(searchQuery);
  }

  // Quick search (simple text query)
  async quickSearch(text: string, limit: number = 10): Promise<SearchResponse> {
    const query = SearchService.buildSearchQuery({
      text,
      pagination: { limit },
    });

    return await this.search(query);
  }
}

export const searchService = new SearchService();