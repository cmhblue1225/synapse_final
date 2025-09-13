import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { KnowledgeNodeEntity, NodeType, ContentType } from '../entities/knowledge-node.entity';
import { SearchQueryDto, AutocompleteQueryDto, SearchResultDto, SearchResponseDto } from '../dto/search.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(KnowledgeNodeEntity)
    private readonly knowledgeNodeRepository: Repository<KnowledgeNodeEntity>,
  ) {}

  async search(userId: string, searchQuery: SearchQueryDto): Promise<SearchResponseDto> {
    const startTime = Date.now();
    this.logger.log(`Search request: ${JSON.stringify(searchQuery)} for user ${userId}`);

    try {
      const queryBuilder = this.createBaseQuery(userId, searchQuery);
      
      // 전체 개수 조회
      const totalCount = await queryBuilder.getCount();
      
      // 페이징 적용
      const offset = (searchQuery.page - 1) * searchQuery.limit;
      queryBuilder.offset(offset).limit(searchQuery.limit);
      
      // 정렬 적용
      this.applySorting(queryBuilder, searchQuery);
      
      // 결과 조회
      const nodes = await queryBuilder.getMany();
      
      // 결과 변환
      const results = await this.transformToSearchResults(nodes, searchQuery.query);
      
      const searchTime = Date.now() - startTime;
      
      const response: SearchResponseDto = {
        results,
        totalCount,
        currentPage: searchQuery.page,
        pageSize: searchQuery.limit,
        totalPages: Math.ceil(totalCount / searchQuery.limit),
        searchTime,
        appliedFilters: this.getAppliedFilters(searchQuery),
      };

      this.logger.log(`Search completed in ${searchTime}ms, found ${totalCount} results`);
      return response;

    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async autocomplete(userId: string, query: AutocompleteQueryDto): Promise<string[]> {
    this.logger.log(`Autocomplete request: ${query.query} for user ${userId}`);

    try {
      // 제목과 태그에서 자동완성 제안 찾기
      const titleSuggestions = await this.knowledgeNodeRepository
        .createQueryBuilder('node')
        .select('DISTINCT node.title', 'title')
        .where('node.userId = :userId', { userId })
        .andWhere('node.isActive = true')
        .andWhere('LOWER(node.title) LIKE LOWER(:query)', { query: `%${query.query}%` })
        .orderBy('LENGTH(node.title)', 'ASC')
        .limit(query.limit)
        .getRawMany();

      const tagSuggestions = await this.knowledgeNodeRepository
        .createQueryBuilder('node')
        .select('UNNEST(node.tags)', 'tag')
        .where('node.userId = :userId', { userId })
        .andWhere('node.isActive = true')
        .andWhere('EXISTS (SELECT 1 FROM UNNEST(node.tags) AS tag WHERE LOWER(tag) LIKE LOWER(:query))', 
          { query: `%${query.query}%` })
        .groupBy('tag')
        .orderBy('COUNT(*)', 'DESC')
        .limit(query.limit)
        .getRawMany();

      const suggestions = [
        ...titleSuggestions.map(s => s.title),
        ...tagSuggestions.map(s => s.tag)
      ].filter((item, index, arr) => arr.indexOf(item) === index)
       .slice(0, query.limit);

      this.logger.log(`Autocomplete found ${suggestions.length} suggestions`);
      return suggestions;

    } catch (error) {
      this.logger.error(`Autocomplete failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPopularTags(userId: string, limit: number = 20): Promise<Array<{ tag: string; count: number }>> {
    this.logger.log(`Getting popular tags for user ${userId}`);

    try {
      const popularTags = await this.knowledgeNodeRepository
        .createQueryBuilder('node')
        .select('UNNEST(node.tags)', 'tag')
        .addSelect('COUNT(*)', 'count')
        .where('node.userId = :userId', { userId })
        .andWhere('node.isActive = true')
        .andWhere('array_length(node.tags, 1) > 0')
        .groupBy('tag')
        .orderBy('count', 'DESC')
        .limit(limit)
        .getRawMany();

      return popularTags.map(item => ({
        tag: item.tag,
        count: parseInt(item.count)
      }));

    } catch (error) {
      this.logger.error(`Get popular tags failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSearchStats(userId: string): Promise<any> {
    this.logger.log(`Getting search stats for user ${userId}`);

    try {
      const stats = await this.knowledgeNodeRepository
        .createQueryBuilder('node')
        .select([
          'COUNT(*) as total_nodes',
          'COUNT(CASE WHEN node.nodeType = :knowledge THEN 1 END) as knowledge_count',
          'COUNT(CASE WHEN node.nodeType = :concept THEN 1 END) as concept_count',
          'COUNT(CASE WHEN node.nodeType = :fact THEN 1 END) as fact_count',
          'COUNT(CASE WHEN node.contentType = :text THEN 1 END) as text_count',
          'COUNT(CASE WHEN node.contentType = :document THEN 1 END) as document_count',
        ])
        .where('node.userId = :userId', { userId })
        .andWhere('node.isActive = true')
        .setParameters({
          knowledge: NodeType.KNOWLEDGE,
          concept: NodeType.CONCEPT,
          fact: NodeType.FACT,
          text: ContentType.TEXT,
          document: ContentType.DOCUMENT,
        })
        .getRawOne();

      return {
        totalNodes: parseInt(stats.total_nodes),
        nodeTypeDistribution: {
          [NodeType.KNOWLEDGE]: parseInt(stats.knowledge_count),
          [NodeType.CONCEPT]: parseInt(stats.concept_count),
          [NodeType.FACT]: parseInt(stats.fact_count),
        },
        contentTypeDistribution: {
          [ContentType.TEXT]: parseInt(stats.text_count),
          [ContentType.DOCUMENT]: parseInt(stats.document_count),
        }
      };

    } catch (error) {
      this.logger.error(`Get search stats failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private createBaseQuery(userId: string, searchQuery: SearchQueryDto): SelectQueryBuilder<KnowledgeNodeEntity> {
    let queryBuilder = this.knowledgeNodeRepository
      .createQueryBuilder('node')
      .where('node.userId = :userId', { userId })
      .andWhere('node.isActive = true');

    // 전체 텍스트 검색 (PostgreSQL full-text search 사용)
    if (searchQuery.query) {
      queryBuilder = queryBuilder.andWhere(
        `(
          to_tsvector('korean', node.title || ' ' || node.content) @@ plainto_tsquery('korean', :query)
          OR LOWER(node.title) LIKE LOWER(:likeQuery)
          OR LOWER(node.content) LIKE LOWER(:likeQuery)
          OR EXISTS (SELECT 1 FROM UNNEST(node.tags) AS tag WHERE LOWER(tag) LIKE LOWER(:likeQuery))
        )`,
        { 
          query: searchQuery.query,
          likeQuery: `%${searchQuery.query}%`
        }
      );
    }

    // 노드 타입 필터
    if (searchQuery.nodeTypes && searchQuery.nodeTypes.length > 0) {
      queryBuilder = queryBuilder.andWhere('node.nodeType IN (:...nodeTypes)', {
        nodeTypes: searchQuery.nodeTypes
      });
    }

    // 콘텐츠 타입 필터
    if (searchQuery.contentTypes && searchQuery.contentTypes.length > 0) {
      queryBuilder = queryBuilder.andWhere('node.contentType IN (:...contentTypes)', {
        contentTypes: searchQuery.contentTypes
      });
    }

    // 태그 필터
    if (searchQuery.tags && searchQuery.tags.length > 0) {
      queryBuilder = queryBuilder.andWhere('node.tags && :tags', {
        tags: searchQuery.tags
      });
    }

    // 날짜 범위 필터
    if (searchQuery.startDate) {
      queryBuilder = queryBuilder.andWhere('node.createdAt >= :startDate', {
        startDate: searchQuery.startDate
      });
    }

    if (searchQuery.endDate) {
      queryBuilder = queryBuilder.andWhere('node.createdAt <= :endDate', {
        endDate: searchQuery.endDate
      });
    }

    return queryBuilder;
  }

  private applySorting(queryBuilder: SelectQueryBuilder<KnowledgeNodeEntity>, searchQuery: SearchQueryDto): void {
    const { sortBy, sortOrder } = searchQuery;

    switch (sortBy) {
      case 'relevance':
        if (searchQuery.query) {
          queryBuilder.orderBy(
            `ts_rank(to_tsvector('korean', node.title || ' ' || node.content), plainto_tsquery('korean', :query))`,
            sortOrder.toUpperCase() as 'ASC' | 'DESC'
          );
        } else {
          queryBuilder.orderBy('node.createdAt', 'DESC');
        }
        break;
      case 'date':
        queryBuilder.orderBy('node.createdAt', sortOrder.toUpperCase() as 'ASC' | 'DESC');
        break;
      case 'title':
        queryBuilder.orderBy('node.title', sortOrder.toUpperCase() as 'ASC' | 'DESC');
        break;
    }
  }

  private async transformToSearchResults(nodes: KnowledgeNodeEntity[], searchQuery?: string): Promise<SearchResultDto[]> {
    return nodes.map(node => {
      // 검색어가 있으면 관련도 점수 계산
      let relevanceScore = 1.0;
      if (searchQuery) {
        const titleMatch = node.title.toLowerCase().includes(searchQuery.toLowerCase());
        const contentMatch = node.content.toLowerCase().includes(searchQuery.toLowerCase());
        const tagMatch = node.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        relevanceScore = (titleMatch ? 0.4 : 0) + (contentMatch ? 0.4 : 0) + (tagMatch ? 0.2 : 0);
        relevanceScore = Math.max(0.1, relevanceScore); // 최소값 보장
      }

      // 하이라이트 생성
      const highlights = this.generateHighlights(node, searchQuery);

      return {
        id: node.id,
        title: node.title,
        content: node.content.length > 200 ? node.content.substring(0, 200) + '...' : node.content,
        contentType: node.contentType,
        nodeType: node.nodeType,
        tags: node.tags || [],
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        relevanceScore,
        highlights,
      };
    });
  }

  private generateHighlights(node: KnowledgeNodeEntity, searchQuery?: string): string[] {
    if (!searchQuery) return [];

    const highlights: string[] = [];
    const query = searchQuery.toLowerCase();

    // 제목에서 하이라이트
    if (node.title.toLowerCase().includes(query)) {
      const highlighted = node.title.replace(
        new RegExp(`(${searchQuery})`, 'gi'),
        '<mark>$1</mark>'
      );
      highlights.push(highlighted);
    }

    // 내용에서 하이라이트 (주변 문맥 포함)
    const contentLower = node.content.toLowerCase();
    const queryIndex = contentLower.indexOf(query);
    if (queryIndex !== -1) {
      const start = Math.max(0, queryIndex - 50);
      const end = Math.min(node.content.length, queryIndex + query.length + 50);
      const snippet = node.content.substring(start, end);
      
      const highlighted = snippet.replace(
        new RegExp(`(${searchQuery})`, 'gi'),
        '<mark>$1</mark>'
      );
      highlights.push(`...${highlighted}...`);
    }

    return highlights;
  }

  private getAppliedFilters(searchQuery: SearchQueryDto): Record<string, any> {
    const filters: Record<string, any> = {};

    if (searchQuery.nodeTypes && searchQuery.nodeTypes.length > 0) {
      filters.nodeTypes = searchQuery.nodeTypes;
    }

    if (searchQuery.contentTypes && searchQuery.contentTypes.length > 0) {
      filters.contentTypes = searchQuery.contentTypes;
    }

    if (searchQuery.tags && searchQuery.tags.length > 0) {
      filters.tags = searchQuery.tags;
    }

    if (searchQuery.startDate || searchQuery.endDate) {
      filters.dateRange = {
        start: searchQuery.startDate,
        end: searchQuery.endDate
      };
    }

    return filters;
  }
}