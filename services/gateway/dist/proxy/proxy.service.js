"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProxyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyService = void 0;
const common_1 = require("@nestjs/common");
const http_proxy_middleware_1 = require("http-proxy-middleware");
let ProxyService = ProxyService_1 = class ProxyService {
    logger = new common_1.Logger(ProxyService_1.name);
    createUsersProxy() {
        const target = process.env.USERS_SERVICE_URL || 'http://localhost:3001';
        this.logger.log(`Creating Users proxy to: ${target}`);
        return (0, http_proxy_middleware_1.createProxyMiddleware)({
            target,
            changeOrigin: true,
            pathRewrite: {
                '^/api/auth': '/auth',
                '^/api/users': '',
            },
        });
    }
    createGraphProxy() {
        const target = process.env.GRAPH_SERVICE_URL || 'http://localhost:3002';
        this.logger.log(`Creating Graph proxy to: ${target}`);
        return (0, http_proxy_middleware_1.createProxyMiddleware)({
            target,
            changeOrigin: true,
            pathRewrite: {
                '^/api/graph': '/api/graph',
            },
        });
    }
    createSearchProxy() {
        const target = process.env.SEARCH_SERVICE_URL || 'http://localhost:3003';
        this.logger.log(`Creating Search proxy to: ${target}`);
        return (0, http_proxy_middleware_1.createProxyMiddleware)({
            target,
            changeOrigin: true,
            pathRewrite: {
                '^/api/search': '/api/search',
            },
        });
    }
    createIngestionProxy() {
        const target = process.env.INGESTION_SERVICE_URL || 'http://localhost:3004';
        this.logger.log(`Creating Ingestion proxy to: ${target}`);
        return (0, http_proxy_middleware_1.createProxyMiddleware)({
            target,
            changeOrigin: true,
            pathRewrite: {
                '^/api/ingestion': '/api/ingestion',
            },
        });
    }
};
exports.ProxyService = ProxyService;
exports.ProxyService = ProxyService = ProxyService_1 = __decorate([
    (0, common_1.Injectable)()
], ProxyService);
//# sourceMappingURL=proxy.service.js.map