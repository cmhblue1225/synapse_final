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
exports.CreateRelationDto = void 0;
const class_validator_1 = require("class-validator");
const semantic_types_1 = require("../../types/semantic-types");
class CreateRelationDto {
    constructor() {
        this.strength = 0.5;
        this.confidence = 0.8;
        this.metadata = {};
    }
}
exports.CreateRelationDto = CreateRelationDto;
__decorate([
    (0, class_validator_1.IsUUID)(4, { message: '시작 노드 ID는 유효한 UUID여야 합니다.' }),
    __metadata("design:type", String)
], CreateRelationDto.prototype, "fromNodeId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(4, { message: '대상 노드 ID는 유효한 UUID여야 합니다.' }),
    __metadata("design:type", String)
], CreateRelationDto.prototype, "toNodeId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(semantic_types_1.SemanticRelationType, { message: '유효한 관계 타입을 선택해주세요.' }),
    __metadata("design:type", String)
], CreateRelationDto.prototype, "relationType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: '강도는 숫자여야 합니다.' }),
    (0, class_validator_1.Min)(0, { message: '강도는 0 이상이어야 합니다.' }),
    (0, class_validator_1.Max)(1, { message: '강도는 1 이하여야 합니다.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateRelationDto.prototype, "strength", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: '확신도는 숫자여야 합니다.' }),
    (0, class_validator_1.Min)(0, { message: '확신도는 0 이상이어야 합니다.' }),
    (0, class_validator_1.Max)(1, { message: '확신도는 1 이하여야 합니다.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateRelationDto.prototype, "confidence", void 0);
__decorate([
    (0, class_validator_1.IsObject)({ message: '메타데이터는 객체여야 합니다.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateRelationDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-relation.dto.js.map