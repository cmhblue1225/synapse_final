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
exports.SemanticRelationEntity = void 0;
const typeorm_1 = require("typeorm");
const semantic_types_1 = require("../types/semantic-types");
let SemanticRelationEntity = class SemanticRelationEntity {
};
exports.SemanticRelationEntity = SemanticRelationEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SemanticRelationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)('from_node_idx'),
    __metadata("design:type", String)
], SemanticRelationEntity.prototype, "fromNodeId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)('to_node_idx'),
    __metadata("design:type", String)
], SemanticRelationEntity.prototype, "toNodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: semantic_types_1.SemanticRelationType,
    }),
    __metadata("design:type", String)
], SemanticRelationEntity.prototype, "relationType", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, default: 0.5 }),
    __metadata("design:type", Number)
], SemanticRelationEntity.prototype, "strength", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 3, scale: 2, default: 0.8 }),
    __metadata("design:type", Number)
], SemanticRelationEntity.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: {} }),
    __metadata("design:type", Object)
], SemanticRelationEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)('user_relations_idx'),
    __metadata("design:type", String)
], SemanticRelationEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], SemanticRelationEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SemanticRelationEntity.prototype, "isSystemGenerated", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], SemanticRelationEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SemanticRelationEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SemanticRelationEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SemanticRelationEntity.prototype, "checksum", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SemanticRelationEntity.prototype, "isBidirectional", void 0);
exports.SemanticRelationEntity = SemanticRelationEntity = __decorate([
    (0, typeorm_1.Entity)('semantic_relations'),
    (0, typeorm_1.Index)(['fromNodeId', 'toNodeId']),
    (0, typeorm_1.Index)(['relationType']),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['strength'])
], SemanticRelationEntity);
//# sourceMappingURL=semantic-relation.entity.js.map