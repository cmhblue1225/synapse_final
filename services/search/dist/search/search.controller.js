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
var SearchController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const search_service_1 = require("./search.service");
const search_dto_1 = require("../dto/search.dto");
let SearchController = SearchController_1 = class SearchController {
    constructor(searchService) {
        this.searchService = searchService;
        this.logger = new common_1.Logger(SearchController_1.name);
    }
    async search(searchQuery, userId) {
        const actualUserId = userId || 'test-user-id';
        this.logger.log(`Search request from user ${actualUserId}: ${JSON.stringify(searchQuery)}`);
        return await this.searchService.search(actualUserId, searchQuery);
    }
    async autocomplete(query, userId) {
        const actualUserId = userId || 'test-user-id';
        this.logger.log(`Autocomplete request from user ${actualUserId}: ${query.query}`);
        const suggestions = await this.searchService.autocomplete(actualUserId, query);
        return { suggestions };
    }
    async getPopularTags(limit, userId) {
        const actualUserId = userId || 'test-user-id';
        const actualLimit = limit || 20;
        this.logger.log(`Popular tags request from user ${actualUserId}, limit: ${actualLimit}`);
        const tags = await this.searchService.getPopularTags(actualUserId, actualLimit);
        return { tags };
    }
    async getSearchStats(userId) {
        const actualUserId = userId || 'test-user-id';
        this.logger.log(`Search stats request from user ${actualUserId}`);
        return await this.searchService.getSearchStats(actualUserId);
    }
    async health() {
        this.logger.log('Health check requested');
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'search',
            version: '1.0.0',
        };
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '지식 노드 검색',
        description: '사용자의 지식 노드들을 키워드, 타입, 태그, 날짜 범위 등으로 검색합니다. PostgreSQL의 전체 텍스트 검색을 활용하여 관련도 높은 결과를 제공합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '검색 성공',
        type: search_dto_1.SearchResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 검색 쿼리',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: '인증 필요',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_dto_1.SearchQueryDto, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('autocomplete'),
    (0, swagger_1.ApiOperation)({
        summary: '자동완성 검색',
        description: '사용자가 입력한 키워드에 대한 자동완성 제안을 제공합니다. 제목과 태그를 기반으로 제안합니다.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'query',
        description: '자동완성할 키워드',
        example: '머신',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: '반환할 제안 수',
        required: false,
        example: 5,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '자동완성 제안 성공',
        schema: {
            type: 'object',
            properties: {
                suggestions: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['머신러닝', '머신러닝 알고리즘', '머신러닝 기초'],
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_dto_1.AutocompleteQueryDto, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "autocomplete", null);
__decorate([
    (0, common_1.Get)('popular-tags'),
    (0, swagger_1.ApiOperation)({
        summary: '인기 태그 조회',
        description: '사용자의 지식 노드에서 자주 사용되는 태그들을 빈도순으로 조회합니다.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: '반환할 태그 수',
        required: false,
        example: 20,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '인기 태그 조회 성공',
        schema: {
            type: 'object',
            properties: {
                tags: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            tag: { type: 'string', example: 'AI' },
                            count: { type: 'number', example: 25 },
                        },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getPopularTags", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: '검색 통계 조회',
        description: '사용자의 지식 노드 통계 정보를 조회합니다. 노드 수, 타입별 분포, 콘텐츠 타입별 분포 등을 제공합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '검색 통계 조회 성공',
        schema: {
            type: 'object',
            properties: {
                totalNodes: { type: 'number', example: 150 },
                nodeTypeDistribution: {
                    type: 'object',
                    properties: {
                        Knowledge: { type: 'number', example: 80 },
                        Concept: { type: 'number', example: 45 },
                        Fact: { type: 'number', example: 25 },
                    },
                },
                contentTypeDistribution: {
                    type: 'object',
                    properties: {
                        text: { type: 'number', example: 120 },
                        document: { type: 'number', example: 30 },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "getSearchStats", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Search Service 상태 확인',
        description: 'Search Service의 상태와 데이터베이스 연결을 확인합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Search Service 정상 상태',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'healthy' },
                timestamp: { type: 'string', example: '2024-01-15T10:30:00Z' },
                service: { type: 'string', example: 'search' },
                version: { type: 'string', example: '1.0.0' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "health", null);
exports.SearchController = SearchController = SearchController_1 = __decorate([
    (0, swagger_1.ApiTags)('search'),
    (0, common_1.Controller)('api/search'),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map