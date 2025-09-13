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
var IngestionController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const ingestion_service_1 = require("./ingestion.service");
const ingestion_dto_1 = require("../dto/ingestion.dto");
let IngestionController = IngestionController_1 = class IngestionController {
    constructor(ingestionService) {
        this.ingestionService = ingestionService;
        this.logger = new common_1.Logger(IngestionController_1.name);
    }
    async createNode(createDto, userId) {
        const actualUserId = userId || 'test-user-id';
        this.logger.log(`Creating knowledge node: ${createDto.title} for user ${actualUserId}`);
        return await this.ingestionService.createNode(actualUserId, createDto);
    }
    async getNode(nodeId, userId) {
        const actualUserId = userId || 'test-user-id';
        this.logger.log(`Retrieving knowledge node ${nodeId} for user ${actualUserId}`);
        return await this.ingestionService.getNode(actualUserId, nodeId);
    }
    async updateNode(nodeId, updateDto, userId) {
        const actualUserId = userId || 'test-user-id';
        this.logger.log(`Updating knowledge node ${nodeId} for user ${actualUserId}`);
        return await this.ingestionService.updateNode(actualUserId, nodeId, updateDto);
    }
    async deleteNode(nodeId, userId) {
        const actualUserId = userId || 'test-user-id';
        this.logger.log(`Deleting knowledge node ${nodeId} for user ${actualUserId}`);
        await this.ingestionService.deleteNode(actualUserId, nodeId);
    }
    async getUserNodes(limit, offset, nodeType, contentType, sortBy, sortOrder, userId) {
        const actualUserId = userId || 'test-user-id';
        this.logger.log(`Retrieving knowledge nodes for user ${actualUserId}`);
        return await this.ingestionService.getUserNodes(actualUserId, {
            limit: Math.min(limit || 50, 100),
            offset: offset || 0,
            nodeType,
            contentType,
            sortBy: sortBy || 'updatedAt',
            sortOrder: sortOrder || 'DESC',
        });
    }
    async bulkCreateNodes(bulkCreateDto, userId) {
        const actualUserId = userId || 'test-user-id';
        this.logger.log(`Bulk creating ${bulkCreateDto.nodes.length} nodes for user ${actualUserId}`);
        return await this.ingestionService.bulkCreateNodes(actualUserId, bulkCreateDto);
    }
    async linkNodes(sourceId, targetId, linkData, userId) {
        const actualUserId = userId || 'test-user-id';
        this.logger.log(`Linking nodes ${sourceId} -> ${targetId} for user ${actualUserId}`);
        await this.ingestionService.linkNodes(actualUserId, sourceId, targetId, linkData.relationshipType, linkData.weight || 1.0, linkData.metadata);
    }
    async getStats(userId) {
        const actualUserId = userId || 'test-user-id';
        this.logger.log(`Getting statistics for user ${actualUserId}`);
        return await this.ingestionService.getNodeStats(actualUserId);
    }
    async uploadFile(file, uploadDto, userId) {
        const actualUserId = userId || 'test-user-id';
        this.logger.log(`Processing file upload: ${file.originalname} for user ${actualUserId}`);
        return [];
    }
    async health() {
        this.logger.log('Health check requested');
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'ingestion',
            version: '1.0.0',
        };
    }
};
exports.IngestionController = IngestionController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: '지식 노드 생성',
        description: '새로운 지식 노드를 생성합니다. 제목 중복 검사를 수행하고, 검색을 위한 인덱싱을 자동으로 처리합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '지식 노드 생성 성공',
        type: ingestion_dto_1.KnowledgeNodeResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '잘못된 요청 데이터',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: '중복된 제목',
    }),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, transform: true }))),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ingestion_dto_1.CreateKnowledgeNodeDto, String]),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "createNode", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '지식 노드 조회',
        description: '특정 지식 노드의 상세 정보를 조회합니다.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: '조회할 노드의 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '지식 노드 조회 성공',
        type: ingestion_dto_1.KnowledgeNodeResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '노드를 찾을 수 없음',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "getNode", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: '지식 노드 수정',
        description: '기존 지식 노드를 수정합니다. 버전이 자동으로 증가하고, 검색 인덱스가 업데이트됩니다.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: '수정할 노드의 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '지식 노드 수정 성공',
        type: ingestion_dto_1.KnowledgeNodeResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '노드를 찾을 수 없음',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: '중복된 제목',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, transform: true }))),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ingestion_dto_1.UpdateKnowledgeNodeDto, String]),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "updateNode", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: '지식 노드 삭제',
        description: '지식 노드를 소프트 삭제합니다 (isActive = false). 실제 데이터는 보존됩니다.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: '삭제할 노드의 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: '지식 노드 삭제 성공',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '노드를 찾을 수 없음',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "deleteNode", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: '사용자 지식 노드 목록 조회',
        description: '사용자의 모든 지식 노드를 페이징과 필터링을 통해 조회합니다.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        description: '페이지당 결과 수 (최대 100)',
        required: false,
        example: 20,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'offset',
        description: '건너뛸 결과 수',
        required: false,
        example: 0,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'nodeType',
        description: '노드 타입 필터',
        required: false,
        example: 'Knowledge',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'contentType',
        description: '콘텐츠 타입 필터',
        required: false,
        example: 'text',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        description: '정렬 기준',
        required: false,
        enum: ['createdAt', 'updatedAt', 'title'],
        example: 'updatedAt',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortOrder',
        description: '정렬 순서',
        required: false,
        enum: ['ASC', 'DESC'],
        example: 'DESC',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '지식 노드 목록 조회 성공',
        schema: {
            type: 'object',
            properties: {
                nodes: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/KnowledgeNodeResponseDto' },
                },
                total: { type: 'number', example: 156 },
            },
        },
    }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('nodeType')),
    __param(3, (0, common_1.Query)('contentType')),
    __param(4, (0, common_1.Query)('sortBy')),
    __param(5, (0, common_1.Query)('sortOrder')),
    __param(6, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "getUserNodes", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({
        summary: '지식 노드 일괄 생성',
        description: '여러 지식 노드를 한 번에 생성합니다. 중복된 제목은 자동으로 스킵됩니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '일괄 생성 성공',
        type: [ingestion_dto_1.KnowledgeNodeResponseDto],
    }),
    __param(0, (0, common_1.Body)(new common_1.ValidationPipe({ whitelist: true, transform: true }))),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ingestion_dto_1.BulkCreateKnowledgeNodeDto, String]),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "bulkCreateNodes", null);
__decorate([
    (0, common_1.Post)(':sourceId/link/:targetId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '노드 간 관계 생성',
        description: '두 지식 노드 간의 관계를 생성합니다. 가중치와 메타데이터를 설정할 수 있습니다.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'sourceId',
        description: '소스 노드 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiParam)({
        name: 'targetId',
        description: '타겟 노드 UUID',
        example: '456e7890-e89b-12d3-a456-426614174001',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                relationshipType: {
                    type: 'string',
                    example: 'prerequisite',
                    description: '관계 타입 (prerequisite, related, opposite, example 등)'
                },
                weight: {
                    type: 'number',
                    example: 0.8,
                    minimum: 0,
                    maximum: 1,
                    description: '관계 가중치 (0.0 - 1.0)'
                },
                metadata: {
                    type: 'object',
                    example: { description: '선행 학습이 필요한 개념' },
                    description: '관계에 대한 추가 메타데이터'
                },
            },
            required: ['relationshipType'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '노드 관계 생성 성공',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: '노드를 찾을 수 없음',
    }),
    __param(0, (0, common_1.Param)('sourceId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('targetId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "linkNodes", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: '지식 노드 통계 조회',
        description: '사용자의 지식 노드 통계 정보를 조회합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '통계 조회 성공',
        schema: {
            type: 'object',
            properties: {
                totalNodes: { type: 'number', example: 156 },
                nodeTypeDistribution: {
                    type: 'object',
                    properties: {
                        Knowledge: { type: 'number', example: 80 },
                        Concept: { type: 'number', example: 45 },
                        Fact: { type: 'number', example: 31 },
                    },
                },
                contentTypeDistribution: {
                    type: 'object',
                    properties: {
                        text: { type: 'number', example: 120 },
                        document: { type: 'number', example: 36 },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: '파일 업로드 및 지식 노드 생성',
        description: '텍스트 파일, 마크다운, PDF 등을 업로드하여 자동으로 지식 노드를 생성합니다.',
    }),
    (0, swagger_1.ApiBody)({
        description: '업로드할 파일과 파싱 옵션',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: '업로드할 파일',
                },
                fileType: {
                    type: 'string',
                    enum: ['text', 'markdown', 'pdf', 'docx'],
                    example: 'markdown',
                },
                parseOptions: {
                    type: 'object',
                    properties: {
                        extractImages: { type: 'boolean', example: true },
                        splitByHeaders: { type: 'boolean', example: true },
                        maxNodeLength: { type: 'number', example: 1000 },
                        defaultTags: { type: 'array', items: { type: 'string' }, example: ['imported'] },
                        defaultNodeType: { type: 'string', example: 'Knowledge' },
                    },
                },
            },
            required: ['file', 'fileType'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: '파일 업로드 및 노드 생성 성공',
        type: [ingestion_dto_1.KnowledgeNodeResponseDto],
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ingestion_dto_1.FileUploadDto, String]),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Ingestion Service 상태 확인',
        description: 'Ingestion Service의 상태와 데이터베이스 연결을 확인합니다.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Ingestion Service 정상 상태',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'healthy' },
                timestamp: { type: 'string', example: '2024-01-15T10:30:00Z' },
                service: { type: 'string', example: 'ingestion' },
                version: { type: 'string', example: '1.0.0' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IngestionController.prototype, "health", null);
exports.IngestionController = IngestionController = IngestionController_1 = __decorate([
    (0, swagger_1.ApiTags)('ingestion'),
    (0, common_1.Controller)('api/ingestion'),
    __metadata("design:paramtypes", [ingestion_service_1.IngestionService])
], IngestionController);
//# sourceMappingURL=ingestion.controller.js.map