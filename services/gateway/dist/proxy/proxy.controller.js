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
exports.ProxyController = void 0;
const common_1 = require("@nestjs/common");
const proxy_service_1 = require("./proxy.service");
let ProxyController = class ProxyController {
    proxyService;
    constructor(proxyService) {
        this.proxyService = proxyService;
    }
    proxyToAuth(req, res, next) {
        const proxy = this.proxyService.createUsersProxy();
        proxy(req, res, next);
    }
    proxyToUsers(req, res, next) {
        const proxy = this.proxyService.createUsersProxy();
        proxy(req, res, next);
    }
    proxyToGraph(req, res, next) {
        const proxy = this.proxyService.createGraphProxy();
        proxy(req, res, next);
    }
    proxyToSearch(req, res, next) {
        const proxy = this.proxyService.createSearchProxy();
        proxy(req, res, next);
    }
    proxyToIngestion(req, res, next) {
        const proxy = this.proxyService.createIngestionProxy();
        proxy(req, res, next);
    }
};
exports.ProxyController = ProxyController;
__decorate([
    (0, common_1.All)('api/auth/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Next)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", void 0)
], ProxyController.prototype, "proxyToAuth", null);
__decorate([
    (0, common_1.All)('api/users/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Next)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", void 0)
], ProxyController.prototype, "proxyToUsers", null);
__decorate([
    (0, common_1.All)('api/graph/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Next)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", void 0)
], ProxyController.prototype, "proxyToGraph", null);
__decorate([
    (0, common_1.All)('api/search/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Next)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", void 0)
], ProxyController.prototype, "proxyToSearch", null);
__decorate([
    (0, common_1.All)('api/ingestion/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Next)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Function]),
    __metadata("design:returntype", void 0)
], ProxyController.prototype, "proxyToIngestion", null);
exports.ProxyController = ProxyController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [proxy_service_1.ProxyService])
], ProxyController);
//# sourceMappingURL=proxy.controller.js.map