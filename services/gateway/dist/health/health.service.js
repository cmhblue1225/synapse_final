"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
let HealthService = HealthService_1 = class HealthService {
    logger = new common_1.Logger(HealthService_1.name);
    startTime = Date.now();
    async checkHealth() {
        const services = await this.checkServices();
        const allServicesUp = Object.values(services).every(service => service.status === 'up');
        return {
            status: allServicesUp ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            version: '1.0.0',
            services,
        };
    }
    async getDetailedHealth() {
        const basicHealth = await this.checkHealth();
        return {
            ...basicHealth,
            system: {
                platform: process.platform,
                nodeVersion: process.version,
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                },
                cpu: process.cpuUsage(),
            },
            gateway: {
                port: process.env.PORT || 3000,
                environment: process.env.NODE_ENV || 'development',
            },
        };
    }
    async checkServices() {
        const services = {
            users: await this.checkService('users', process.env.USERS_SERVICE_URL || 'http://users:3001'),
            graph: await this.checkService('graph', process.env.GRAPH_SERVICE_URL || 'http://graph:3002'),
            search: await this.checkService('search', process.env.SEARCH_SERVICE_URL || 'http://search:3003'),
            ingestion: await this.checkService('ingestion', process.env.INGESTION_SERVICE_URL || 'http://ingestion:3004'),
        };
        return services;
    }
    async checkService(name, url) {
        const startTime = Date.now();
        try {
            const isUp = await this.pingService(url);
            const responseTime = Date.now() - startTime;
            if (isUp) {
                return {
                    status: 'up',
                    responseTime,
                    url,
                    lastChecked: new Date().toISOString(),
                };
            }
            else {
                throw new Error('Service not responding');
            }
        }
        catch (error) {
            this.logger.error(`Health check failed for ${name}:`, error.message);
            return {
                status: 'down',
                responseTime: Date.now() - startTime,
                url,
                error: error.message,
                lastChecked: new Date().toISOString(),
            };
        }
    }
    async pingService(url) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (url.includes('users') || url.includes('graph')) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            }, Math.random() * 100);
        });
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)()
], HealthService);
//# sourceMappingURL=health.service.js.map