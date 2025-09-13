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
exports.FileUploadDto = exports.BulkCreateKnowledgeNodeDto = exports.KnowledgeNodeResponseDto = exports.UpdateKnowledgeNodeDto = exports.CreateKnowledgeNodeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const knowledge_node_entity_1 = require("../entities/knowledge-node.entity");
class CreateKnowledgeNodeDto {
    constructor() {
        this.contentType = knowledge_node_entity_1.ContentType.TEXT;
        this.nodeType = knowledge_node_entity_1.NodeType.KNOWLEDGE;
        this.tags = [];
        this.metadata = {};
        this.relatedNodes = [];
    }
}
exports.CreateKnowledgeNodeDto = CreateKnowledgeNodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '노드 제목',
        example: 'React Hook의 이해',
        minLength: 1,
        maxLength: 500,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateKnowledgeNodeDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '노드 내용',
        example: 'React Hook은 함수형 컴포넌트에서 상태와 생명주기 기능을 사용할 수 있게 해주는 기능입니다...',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateKnowledgeNodeDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '콘텐츠 타입',
        enum: knowledge_node_entity_1.ContentType,
        default: knowledge_node_entity_1.ContentType.TEXT,
        example: knowledge_node_entity_1.ContentType.TEXT,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(knowledge_node_entity_1.ContentType),
    __metadata("design:type", String)
], CreateKnowledgeNodeDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '노드 타입',
        enum: knowledge_node_entity_1.NodeType,
        default: knowledge_node_entity_1.NodeType.KNOWLEDGE,
        example: knowledge_node_entity_1.NodeType.KNOWLEDGE,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(knowledge_node_entity_1.NodeType),
    __metadata("design:type", String)
], CreateKnowledgeNodeDto.prototype, "nodeType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '태그 배열',
        type: [String],
        example: ['React', 'Hook', 'Frontend', 'JavaScript'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_transformer_1.Transform)(({ value }) => Array.isArray(value) ? value.filter(tag => tag.trim().length > 0) : []),
    __metadata("design:type", Array)
], CreateKnowledgeNodeDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '추가 메타데이터',
        example: {
            source: 'https://reactjs.org/docs/hooks-intro.html',
            difficulty: 'intermediate',
            estimatedReadTime: '5 minutes'
        },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateKnowledgeNodeDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '관련된 노드들과의 관계 정보',
        example: [
            {
                id: '123e4567-e89b-12d3-a456-426614174000',
                relationshipType: 'prerequisite',
                weight: 0.8,
                metadata: { description: '이해하기 전에 필요한 개념' }
            }
        ],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateKnowledgeNodeDto.prototype, "relatedNodes", void 0);
class UpdateKnowledgeNodeDto extends (0, swagger_1.PartialType)(CreateKnowledgeNodeDto) {
}
exports.UpdateKnowledgeNodeDto = UpdateKnowledgeNodeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '노드 활성 상태',
        example: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateKnowledgeNodeDto.prototype, "isActive", void 0);
class KnowledgeNodeResponseDto {
}
exports.KnowledgeNodeResponseDto = KnowledgeNodeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '노드 ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], KnowledgeNodeResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '노드 제목',
        example: 'React Hook의 이해',
    }),
    __metadata("design:type", String)
], KnowledgeNodeResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '노드 내용',
        example: 'React Hook은 함수형 컴포넌트에서 상태와 생명주기 기능을 사용할 수 있게 해주는 기능입니다...',
    }),
    __metadata("design:type", String)
], KnowledgeNodeResponseDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '콘텐츠 타입',
        enum: knowledge_node_entity_1.ContentType,
        example: knowledge_node_entity_1.ContentType.TEXT,
    }),
    __metadata("design:type", String)
], KnowledgeNodeResponseDto.prototype, "contentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '노드 타입',
        enum: knowledge_node_entity_1.NodeType,
        example: knowledge_node_entity_1.NodeType.KNOWLEDGE,
    }),
    __metadata("design:type", String)
], KnowledgeNodeResponseDto.prototype, "nodeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '사용자 ID',
        example: 'user123',
    }),
    __metadata("design:type", String)
], KnowledgeNodeResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '태그 배열',
        type: [String],
        example: ['React', 'Hook', 'Frontend', 'JavaScript'],
    }),
    __metadata("design:type", Array)
], KnowledgeNodeResponseDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '메타데이터',
        example: {
            source: 'https://reactjs.org/docs/hooks-intro.html',
            difficulty: 'intermediate'
        },
    }),
    __metadata("design:type", Object)
], KnowledgeNodeResponseDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '관련 노드들',
        example: [
            {
                id: '123e4567-e89b-12d3-a456-426614174000',
                relationshipType: 'prerequisite',
                weight: 0.8
            }
        ],
    }),
    __metadata("design:type", Array)
], KnowledgeNodeResponseDto.prototype, "relatedNodes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '버전',
        example: 1,
    }),
    __metadata("design:type", Number)
], KnowledgeNodeResponseDto.prototype, "version", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '활성 상태',
        example: true,
    }),
    __metadata("design:type", Boolean)
], KnowledgeNodeResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '생성일',
        example: '2024-01-15T09:30:00Z',
    }),
    __metadata("design:type", Date)
], KnowledgeNodeResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '수정일',
        example: '2024-01-20T14:45:00Z',
    }),
    __metadata("design:type", Date)
], KnowledgeNodeResponseDto.prototype, "updatedAt", void 0);
class BulkCreateKnowledgeNodeDto {
}
exports.BulkCreateKnowledgeNodeDto = BulkCreateKnowledgeNodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '생성할 노드들의 배열',
        type: [CreateKnowledgeNodeDto],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => CreateKnowledgeNodeDto),
    __metadata("design:type", Array)
], BulkCreateKnowledgeNodeDto.prototype, "nodes", void 0);
class FileUploadDto {
}
exports.FileUploadDto = FileUploadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '파일 타입',
        enum: ['text', 'markdown', 'pdf', 'docx'],
        example: 'markdown',
    }),
    (0, class_validator_1.IsEnum)(['text', 'markdown', 'pdf', 'docx']),
    __metadata("design:type", String)
], FileUploadDto.prototype, "fileType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '파싱 옵션',
        example: {
            extractImages: true,
            splitByHeaders: true,
            maxNodeLength: 1000
        },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], FileUploadDto.prototype, "parseOptions", void 0);
//# sourceMappingURL=ingestion.dto.js.map