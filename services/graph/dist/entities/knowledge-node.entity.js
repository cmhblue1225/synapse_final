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
exports.KnowledgeNodeEntity = void 0;
const typeorm_1 = require("typeorm");
const semantic_types_1 = require("../types/semantic-types");
let KnowledgeNodeEntity = class KnowledgeNodeEntity {
};
exports.KnowledgeNodeEntity = KnowledgeNodeEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KnowledgeNodeEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500 }),
    (0, typeorm_1.Index)('title_search_idx'),
    __metadata("design:type", String)
], KnowledgeNodeEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], KnowledgeNodeEntity.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: semantic_types_1.ContentType,
        default: semantic_types_1.ContentType.TEXT,
    }),
    __metadata("design:type", String)
], KnowledgeNodeEntity.prototype, "contentType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: semantic_types_1.NodeType,
        default: semantic_types_1.NodeType.KNOWLEDGE,
    }),
    __metadata("design:type", String)
], KnowledgeNodeEntity.prototype, "nodeType", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)('user_nodes_idx'),
    __metadata("design:type", String)
], KnowledgeNodeEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: {} }),
    __metadata("design:type", Object)
], KnowledgeNodeEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { default: '' }),
    __metadata("design:type", Array)
], KnowledgeNodeEntity.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], KnowledgeNodeEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], KnowledgeNodeEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], KnowledgeNodeEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], KnowledgeNodeEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('tsvector', {
        nullable: true,
        comment: 'Full-text search vector for title and content'
    }),
    __metadata("design:type", String)
], KnowledgeNodeEntity.prototype, "searchVector", void 0);
exports.KnowledgeNodeEntity = KnowledgeNodeEntity = __decorate([
    (0, typeorm_1.Entity)('knowledge_nodes'),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['nodeType']),
    (0, typeorm_1.Index)(['title'])
], KnowledgeNodeEntity);
//# sourceMappingURL=knowledge-node.entity.js.map