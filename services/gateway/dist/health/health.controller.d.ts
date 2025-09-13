import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        services: {
            users: {
                status: string;
                responseTime: number;
                url: string;
                lastChecked: string;
                error?: undefined;
            } | {
                status: string;
                responseTime: number;
                url: string;
                error: any;
                lastChecked: string;
            };
            graph: {
                status: string;
                responseTime: number;
                url: string;
                lastChecked: string;
                error?: undefined;
            } | {
                status: string;
                responseTime: number;
                url: string;
                error: any;
                lastChecked: string;
            };
            search: {
                status: string;
                responseTime: number;
                url: string;
                lastChecked: string;
                error?: undefined;
            } | {
                status: string;
                responseTime: number;
                url: string;
                error: any;
                lastChecked: string;
            };
            ingestion: {
                status: string;
                responseTime: number;
                url: string;
                lastChecked: string;
                error?: undefined;
            } | {
                status: string;
                responseTime: number;
                url: string;
                error: any;
                lastChecked: string;
            };
        };
    }>;
    getDetailedHealth(): Promise<{
        system: {
            platform: NodeJS.Platform;
            nodeVersion: string;
            memory: {
                used: number;
                total: number;
            };
            cpu: NodeJS.CpuUsage;
        };
        gateway: {
            port: string | number;
            environment: string;
        };
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        services: {
            users: {
                status: string;
                responseTime: number;
                url: string;
                lastChecked: string;
                error?: undefined;
            } | {
                status: string;
                responseTime: number;
                url: string;
                error: any;
                lastChecked: string;
            };
            graph: {
                status: string;
                responseTime: number;
                url: string;
                lastChecked: string;
                error?: undefined;
            } | {
                status: string;
                responseTime: number;
                url: string;
                error: any;
                lastChecked: string;
            };
            search: {
                status: string;
                responseTime: number;
                url: string;
                lastChecked: string;
                error?: undefined;
            } | {
                status: string;
                responseTime: number;
                url: string;
                error: any;
                lastChecked: string;
            };
            ingestion: {
                status: string;
                responseTime: number;
                url: string;
                lastChecked: string;
                error?: undefined;
            } | {
                status: string;
                responseTime: number;
                url: string;
                error: any;
                lastChecked: string;
            };
        };
    }>;
    getServiceStatus(): Promise<{
        users: {
            status: string;
            responseTime: number;
            url: string;
            lastChecked: string;
            error?: undefined;
        } | {
            status: string;
            responseTime: number;
            url: string;
            error: any;
            lastChecked: string;
        };
        graph: {
            status: string;
            responseTime: number;
            url: string;
            lastChecked: string;
            error?: undefined;
        } | {
            status: string;
            responseTime: number;
            url: string;
            error: any;
            lastChecked: string;
        };
        search: {
            status: string;
            responseTime: number;
            url: string;
            lastChecked: string;
            error?: undefined;
        } | {
            status: string;
            responseTime: number;
            url: string;
            error: any;
            lastChecked: string;
        };
        ingestion: {
            status: string;
            responseTime: number;
            url: string;
            lastChecked: string;
            error?: undefined;
        } | {
            status: string;
            responseTime: number;
            url: string;
            error: any;
            lastChecked: string;
        };
    }>;
}
