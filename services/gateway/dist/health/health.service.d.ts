export declare class HealthService {
    private readonly logger;
    private startTime;
    checkHealth(): Promise<{
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
    checkServices(): Promise<{
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
    private checkService;
    private pingService;
}
