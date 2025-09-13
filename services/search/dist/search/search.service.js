"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const knowledge_node_entity_1 = require("../entities/knowledge-node.entity");
let SearchService = SearchService_1 = class SearchService {
    constructor(knowledgeNodeRepository) {
        this.knowledgeNodeRepository = knowledgeNodeRepository;
        this.logger = new common_1.Logger(SearchService_1.name);
    }
    async search(userId, searchQuery) {
        const startTime = Date.now();
        this.logger.log(`Search request: ${JSON.stringify(searchQuery)} for user ${userId}`);
        try {
            const queryBuilder = this.createBaseQuery(userId, searchQuery);
            const totalCount = await queryBuilder.getCount();
            const offset = (searchQuery.page - 1) * searchQuery.limit;
            queryBuilder.offset(offset).limit(searchQuery.limit);
            this.applySorting(queryBuilder, searchQuery);
            const nodes = await queryBuilder.getMany();
            const results = await this.transformToSearchResults(nodes, searchQuery.query);
            const searchTime = Date.now() - startTime;
            const response = {
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
        }
        catch (error) {
            this.logger.error(`Search failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async autocomplete(userId, query) {
        this.logger.log(`Autocomplete request: ${query.query} for user ${userId}`);
        try {
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
                .andWhere('EXISTS (SELECT 1 FROM UNNEST(node.tags) AS tag WHERE LOWER(tag) LIKE LOWER(:query))', { query: `%${query.query}%` })
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
        }
        catch (error) {
            this.logger.error(`Autocomplete failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getPopularTags(userId, limit = 20) {
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
        }
        catch (error) {
            this.logger.error(`Get popular tags failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getSearchStats(userId) {
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
                knowledge: knowledge_node_entity_1.NodeType.KNOWLEDGE,
                concept: knowledge_node_entity_1.NodeType.CONCEPT,
                fact: knowledge_node_entity_1.NodeType.FACT,
                text: knowledge_node_entity_1.ContentType.TEXT,
                document: knowledge_node_entity_1.ContentType.DOCUMENT,
            })
                .getRawOne();
            return {
                totalNodes: parseInt(stats.total_nodes),
                nodeTypeDistribution: {
                    [knowledge_node_entity_1.NodeType.KNOWLEDGE]: parseInt(stats.knowledge_count),
                    [knowledge_node_entity_1.NodeType.CONCEPT]: parseInt(stats.concept_count),
                    [knowledge_node_entity_1.NodeType.FACT]: parseInt(stats.fact_count),
                },
                contentTypeDistribution: {
                    [knowledge_node_entity_1.ContentType.TEXT]: parseInt(stats.text_count),
                    [knowledge_node_entity_1.ContentType.DOCUMENT]: parseInt(stats.document_count),
                }
            };
        }
        catch (error) {
            this.logger.error(`Get search stats failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    createBaseQuery(userId, searchQuery) {
        let queryBuilder = this.knowledgeNodeRepository
            .createQueryBuilder('node')
            .where('node.userId = :userId', { userId })
            .andWhere('node.isActive = true');
        if (searchQuery.query) {
            queryBuilder = queryBuilder.andWhere(`(
          to_tsvector('korean', node.title || ' ' || node.content) @@ plainto_tsquery('korean', :query)
          OR LOWER(node.title) LIKE LOWER(:likeQuery)
          OR LOWER(node.content) LIKE LOWER(:likeQuery)
          OR EXISTS (SELECT 1 FROM UNNEST(node.tags) AS tag WHERE LOWER(tag) LIKE LOWER(:likeQuery))
        )`, {
                query: searchQuery.query,
                likeQuery: `%${searchQuery.query}%`
            });
        }
        if (searchQuery.nodeTypes && searchQuery.nodeTypes.length > 0) {
            queryBuilder = queryBuilder.andWhere('node.nodeType IN (:...nodeTypes)', {
                nodeTypes: searchQuery.nodeTypes
            });
        }
        if (searchQuery.contentTypes && searchQuery.contentTypes.length > 0) {
            queryBuilder = queryBuilder.andWhere('node.contentType IN (:...contentTypes)', {
                contentTypes: searchQuery.contentTypes
            });
        }
        if (searchQuery.tags && searchQuery.tags.length > 0) {
            queryBuilder = queryBuilder.andWhere('node.tags && :tags', {
                tags: searchQuery.tags
            });
        }
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
    applySorting(queryBuilder, searchQuery) {
        const { sortBy, sortOrder } = searchQuery;
        switch (sortBy) {
            case 'relevance':
                if (searchQuery.query) {
                    queryBuilder.orderBy(`ts_rank(to_tsvector('korean', node.title || ' ' || node.content), plainto_tsquery('korean', :query))`, sortOrder.toUpperCase());
                }
                else {
                    queryBuilder.orderBy('node.createdAt', 'DESC');
                }
                break;
            case 'date':
                queryBuilder.orderBy('node.createdAt', sortOrder.toUpperCase());
                break;
            case 'title':
                queryBuilder.orderBy('node.title', sortOrder.toUpperCase());
                break;
        }
    }
    async transformToSearchResults(nodes, searchQuery) {
        return nodes.map(node => {
            let relevanceScore = 1.0;
            if (searchQuery) {
                const titleMatch = node.title.toLowerCase().includes(searchQuery.toLowerCase());
                const contentMatch = node.content.toLowerCase().includes(searchQuery.toLowerCase());
                const tagMatch = node.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
                relevanceScore = (titleMatch ? 0.4 : 0) + (contentMatch ? 0.4 : 0) + (tagMatch ? 0.2 : 0);
                relevanceScore = Math.max(0.1, relevanceScore);
            }
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
    generateHighlights(node, searchQuery) {
        if (!searchQuery)
            return [];
        const highlights = [];
        const query = searchQuery.toLowerCase();
        if (node.title.toLowerCase().includes(query)) {
            const highlighted = node.title.replace(new RegExp(`(${searchQuery})`, 'gi'), '<mark>$1</mark>');
            highlights.push(highlighted);
        }
        const contentLower = node.content.toLowerCase();
        const queryIndex = contentLower.indexOf(query);
        if (queryIndex !== -1) {
            const start = Math.max(0, queryIndex - 50);
            const end = Math.min(node.content.length, queryIndex + query.length + 50);
            const snippet = node.content.substring(start, end);
            const highlighted = snippet.replace(new RegExp(`(${searchQuery})`, 'gi'), '<mark>$1</mark>');
            highlights.push(`...${highlighted}...`);
        }
        return highlights;
    }
    getAppliedFilters(searchQuery) {
        const filters = {};
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
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(knowledge_node_entity_1.KnowledgeNodeEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SearchService);
//# sourceMappingURL=search.service.js.map