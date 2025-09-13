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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchResponseDto = exports.SearchResultDto = exports.AutocompleteQueryDto = exports.SearchQueryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const knowledge_node_entity_1 = require("../entities/knowledge-node.entity");
class SearchQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortBy = 'relevance';
        this.sortOrder = 'desc';
    }
}
exports.SearchQueryDto = SearchQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '검색할 키워드 또는 구문',
        example: '머신러닝 알고리즘',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '검색할 노드 타입들',
        enum: knowledge_node_entity_1.NodeType,
        isArray: true,
        example: [knowledge_node_entity_1.NodeType.KNOWLEDGE, knowledge_node_entity_1.NodeType.CONCEPT],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(knowledge_node_entity_1.NodeType, { each: true }),
    __metadata("design:type", Array)
], SearchQueryDto.prototype, "nodeTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '검색할 콘텐츠 타입들',
        enum: knowledge_node_entity_1.ContentType,
        isArray: true,
        example: [knowledge_node_entity_1.ContentType.TEXT, knowledge_node_entity_1.ContentType.DOCUMENT],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(knowledge_node_entity_1.ContentType, { each: true }),
    __metadata("design:type", Array)
], SearchQueryDto.prototype, "contentTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '검색할 태그들',
        type: [String],
        example: ['AI', '딥러닝', '기계학습'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SearchQueryDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '검색 시작 날짜 (YYYY-MM-DD)',
        example: '2024-01-01',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '검색 종료 날짜 (YYYY-MM-DD)',
        example: '2024-12-31',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '페이지 번호 (1부터 시작)',
        minimum: 1,
        default: 1,
        example: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], SearchQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '페이지당 결과 수 (1-100)',
        minimum: 1,
        maximum: 100,
        default: 10,
        example: 10,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], SearchQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '정렬 기준',
        enum: ['relevance', 'date', 'title'],
        default: 'relevance',
        example: 'relevance',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['relevance', 'date', 'title']),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '정렬 순서',
        enum: ['asc', 'desc'],
        default: 'desc',
        example: 'desc',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "sortOrder", void 0);
class AutocompleteQueryDto {
    constructor() {
        this.limit = 5;
    }
}
exports.AutocompleteQueryDto = AutocompleteQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '자동완성을 위한 부분 키워드',
        example: '머신',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AutocompleteQueryDto.prototype, "query", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '반환할 제안 수',
        minimum: 1,
        maximum: 20,
        default: 5,
        example: 5,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], AutocompleteQueryDto.prototype, "limit", void 0);
class SearchResultDto {
}
exports.SearchResultDto = SearchResultDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '노드 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], SearchResultDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '노드 제목',
        example: '머신러닝 기초 개념',
    }),
    __metadata("design:type", String)
], SearchResultDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '노드 내용 (요약)',
        example: '머신러닝은 컴퓨터가 명시적으로 프로그래밍되지 않고도 학습할 수 있게 하는...',
    }),
    __metadata("design:type", String)
], SearchResultDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '콘텐츠 타입',
        enum: knowledge_node_entity_1.ContentType,
        example: knowledge_node_entity_1.ContentType.TEXT,
    }),
    __metadata("design:type", String)
], SearchResultDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '노드 타입',
        enum: knowledge_node_entity_1.NodeType,
        example: knowledge_node_entity_1.NodeType.KNOWLEDGE,
    }),
    __metadata("design:type", String)
], SearchResultDto.prototype, "nodeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '태그들',
        type: [String],
        example: ['AI', '머신러닝', '기초'],
    }),
    __metadata("design:type", Array)
], SearchResultDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '생성 날짜',
        example: '2024-01-15T09:30:00Z',
    }),
    __metadata("design:type", Date)
], SearchResultDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '수정 날짜',
        example: '2024-01-20T14:45:00Z',
    }),
    __metadata("design:type", Date)
], SearchResultDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '검색 관련도 점수 (0.0-1.0)',
        example: 0.85,
    }),
    __metadata("design:type", Number)
], SearchResultDto.prototype, "relevanceScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '강조된 텍스트 스니펫들',
        type: [String],
        example: ['<mark>머신러닝</mark>은 AI의 한 분야로...', '다양한 <mark>알고리즘</mark>이 존재합니다.'],
    }),
    __metadata("design:type", Array)
], SearchResultDto.prototype, "highlights", void 0);
class SearchResponseDto {
}
exports.SearchResponseDto = SearchResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '검색 결과들',
        type: [SearchResultDto],
    }),
    __metadata("design:type", Array)
], SearchResponseDto.prototype, "results", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '전체 결과 수',
        example: 156,
    }),
    __metadata("design:type", Number)
], SearchResponseDto.prototype, "totalCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '현재 페이지',
        example: 1,
    }),
    __metadata("design:type", Number)
], SearchResponseDto.prototype, "currentPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '페이지당 결과 수',
        example: 10,
    }),
    __metadata("design:type", Number)
], SearchResponseDto.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '전체 페이지 수',
        example: 16,
    }),
    __metadata("design:type", Number)
], SearchResponseDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '검색 소요 시간 (밀리초)',
        example: 45,
    }),
    __metadata("design:type", Number)
], SearchResponseDto.prototype, "searchTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '적용된 필터들',
        example: { nodeTypes: ['Knowledge'], tags: ['AI'] },
    }),
    __metadata("design:type", Object)
], SearchResponseDto.prototype, "appliedFilters", void 0);
//# sourceMappingURL=search.dto.js.map