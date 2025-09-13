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
exports.CreateNodeDto = void 0;
const class_validator_1 = require("class-validator");
const semantic_types_1 = require("../../types/semantic-types");
class CreateNodeDto {
    constructor() {
        this.contentType = semantic_types_1.ContentType.TEXT;
        this.nodeType = semantic_types_1.NodeType.KNOWLEDGE;
        this.metadata = {};
        this.tags = [];
    }
}
exports.CreateNodeDto = CreateNodeDto;
__decorate([
    (0, class_validator_1.IsString)({ message: '제목은 문자열이어야 합니다.' }),
    (0, class_validator_1.MinLength)(1, { message: '제목은 최소 1글자 이상이어야 합니다.' }),
    (0, class_validator_1.MaxLength)(500, { message: '제목은 500글자를 초과할 수 없습니다.' }),
    __metadata("design:type", String)
], CreateNodeDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: '내용은 문자열이어야 합니다.' }),
    (0, class_validator_1.MinLength)(1, { message: '내용은 최소 1글자 이상이어야 합니다.' }),
    __metadata("design:type", String)
], CreateNodeDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(semantic_types_1.ContentType, { message: '유효한 콘텐츠 타입을 선택해주세요.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNodeDto.prototype, "contentType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(semantic_types_1.NodeType, { message: '유효한 노드 타입을 선택해주세요.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNodeDto.prototype, "nodeType", void 0);
__decorate([
    (0, class_validator_1.IsObject)({ message: '메타데이터는 객체여야 합니다.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateNodeDto.prototype, "metadata", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: '태그는 배열이어야 합니다.' }),
    (0, class_validator_1.IsString)({ each: true, message: '모든 태그는 문자열이어야 합니다.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateNodeDto.prototype, "tags", void 0);
//# sourceMappingURL=create-node.dto.js.map