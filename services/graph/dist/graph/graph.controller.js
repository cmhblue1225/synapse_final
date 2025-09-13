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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphController = void 0;
const common_1 = require("@nestjs/common");
const graph_service_1 = require("./graph.service");
const create_node_dto_1 = require("./dto/create-node.dto");
const create_relation_dto_1 = require("./dto/create-relation.dto");
let GraphController = class GraphController {
    constructor(graphService) {
        this.graphService = graphService;
    }
    async createNode(createNodeDto, req) {
        const userId = req.user?.id || 'temp-user-id';
        return await this.graphService.createNode({
            ...createNodeDto,
            userId,
        });
    }
    async getNode(id) {
        return await this.graphService.getNode(id);
    }
    async updateNode(id, updateNodeDto) {
        return await this.graphService.updateNode(id, updateNodeDto);
    }
    async deleteNode(id) {
        await this.graphService.deleteNode(id);
        return { success: true, message: '노드가 성공적으로 삭제되었습니다.' };
    }
    async createRelation(createRelationDto, req) {
        const userId = req.user?.id || 'temp-user-id';
        return await this.graphService.createRelation({
            ...createRelationDto,
            userId,
        });
    }
    async updateRelation(id, updateRelationDto) {
        return await this.graphService.updateRelation(id, updateRelationDto);
    }
    async deleteRelation(id) {
        await this.graphService.deleteRelation(id);
        return { success: true, message: '관계가 성공적으로 삭제되었습니다.' };
    }
    async searchNodes(query = '', limit, offset, req) {
        const userId = req.user?.id || 'temp-user-id';
        return await this.graphService.searchNodes(query, userId, limit, offset);
    }
    async findPath(fromNodeId, toNodeId, maxDepth) {
        return await this.graphService.findPath(fromNodeId, toNodeId, maxDepth);
    }
    async getGraphStats(req) {
        const userId = req.user?.id || 'temp-user-id';
        return await this.graphService.getGraphStats(userId);
    }
    async getNodeNeighbors(nodeId, depth) {
        return {
            nodeId,
            neighbors: [],
            depth,
            message: '이웃 노드 탐색 기능은 구현 예정입니다.',
        };
    }
    async getClusters(req) {
        const userId = req.user?.id || 'temp-user-id';
        return {
            userId,
            clusters: [],
            message: '클러스터 분석 기능은 구현 예정입니다.',
        };
    }
    async getRecommendations(nodeId) {
        return {
            nodeId,
            recommendations: [],
            message: '추천 시스템은 구현 예정입니다.',
        };
    }
    async getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'Graph Service is running',
        };
    }
    async getNeo4jStatus() {
        const isConnected = await this.graphService['neo4jService'].checkConnection();
        const serverInfo = isConnected ?
            await this.graphService['neo4jService'].getServerInfo() : null;
        return {
            connected: isConnected,
            serverInfo,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.GraphController = GraphController;
__decorate([
    (0, common_1.Post)('nodes'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_node_dto_1.CreateNodeDto, Object]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "createNode", null);
__decorate([
    (0, common_1.Get)('nodes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "getNode", null);
__decorate([
    (0, common_1.Put)('nodes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "updateNode", null);
__decorate([
    (0, common_1.Delete)('nodes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "deleteNode", null);
__decorate([
    (0, common_1.Post)('relations'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_relation_dto_1.CreateRelationDto, Object]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "createRelation", null);
__decorate([
    (0, common_1.Put)('relations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "updateRelation", null);
__decorate([
    (0, common_1.Delete)('relations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "deleteRelation", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "searchNodes", null);
__decorate([
    (0, common_1.Get)('path'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __param(2, (0, common_1.Query)('maxDepth', new common_1.DefaultValuePipe(6), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "findPath", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "getGraphStats", null);
__decorate([
    (0, common_1.Get)('nodes/:id/neighbors'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('depth', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "getNodeNeighbors", null);
__decorate([
    (0, common_1.Get)('clusters'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "getClusters", null);
__decorate([
    (0, common_1.Get)('recommendations/:nodeId'),
    __param(0, (0, common_1.Param)('nodeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('neo4j/status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GraphController.prototype, "getNeo4jStatus", null);
exports.GraphController = GraphController = __decorate([
    (0, common_1.Controller)('graph'),
    __metadata("design:paramtypes", [graph_service_1.GraphService])
], GraphController);
//# sourceMappingURL=graph.controller.js.map