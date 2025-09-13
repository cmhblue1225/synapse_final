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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const health_service_1 = require("./health.service");
let HealthController = class HealthController {
    healthService;
    constructor(healthService) {
        this.healthService = healthService;
    }
    async getHealth() {
        return await this.healthService.checkHealth();
    }
    async getDetailedHealth() {
        return await this.healthService.getDetailedHealth();
    }
    async getServiceStatus() {
        return await this.healthService.checkServices();
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Gateway Health Check',
        description: 'Check the health status of the API Gateway and all connected services',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Health check successful',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', example: '2025-09-12T12:58:00.000Z' },
                uptime: { type: 'number', example: 3600 },
                version: { type: 'string', example: '1.0.0' },
                services: {
                    type: 'object',
                    properties: {
                        users: {
                            type: 'object',
                            properties: {
                                status: { type: 'string', example: 'up' },
                                responseTime: { type: 'number', example: 45 },
                            }
                        },
                        graph: {
                            type: 'object',
                            properties: {
                                status: { type: 'string', example: 'up' },
                                responseTime: { type: 'number', example: 67 },
                            }
                        },
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 503,
        description: 'One or more services are unavailable',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('detailed'),
    (0, swagger_1.ApiOperation)({
        summary: 'Detailed Health Check',
        description: 'Get detailed health information including database connections and system metrics',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getDetailedHealth", null);
__decorate([
    (0, common_1.Get)('services'),
    (0, swagger_1.ApiOperation)({
        summary: 'Service Status',
        description: 'Check the status of all connected microservices',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getServiceStatus", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('System'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [health_service_1.HealthService])
], HealthController);
//# sourceMappingURL=health.controller.js.map