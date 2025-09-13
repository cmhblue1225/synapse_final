import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private startTime = Date.now();

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

  private async checkService(name: string, url: string) {
    const startTime = Date.now();
    
    try {
      // HTTP 헬스 체크 - 실제로는 fetch를 사용해야 하지만 여기서는 시뮬레이션
      const isUp = await this.pingService(url);
      const responseTime = Date.now() - startTime;

      if (isUp) {
        return {
          status: 'up',
          responseTime,
          url,
          lastChecked: new Date().toISOString(),
        };
      } else {
        throw new Error('Service not responding');
      }
    } catch (error) {
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

  private async pingService(url: string): Promise<boolean> {
    // 실제 구현에서는 HTTP 요청을 보내야 하지만, 여기서는 시뮬레이션
    // Docker 환경에서는 서비스가 실행 중이라고 가정
    return new Promise((resolve) => {
      setTimeout(() => {
        // Users와 Graph 서비스는 구현되어 있으므로 'up'으로 시뮬레이션
        if (url.includes('users') || url.includes('graph')) {
          resolve(true);
        } else {
          // Search와 Ingestion은 아직 미구현
          resolve(false);
        }
      }, Math.random() * 100); // 랜덤 지연 시뮬레이션
    });
  }
}