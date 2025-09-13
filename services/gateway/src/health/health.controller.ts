import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('System')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Gateway Health Check',
    description: 'Check the health status of the API Gateway and all connected services',
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 503,
    description: 'One or more services are unavailable',
  })
  async getHealth() {
    return await this.healthService.checkHealth();
  }

  @Get('detailed')
  @ApiOperation({
    summary: 'Detailed Health Check',
    description: 'Get detailed health information including database connections and system metrics',
  })
  async getDetailedHealth() {
    return await this.healthService.getDetailedHealth();
  }

  @Get('services')
  @ApiOperation({
    summary: 'Service Status',
    description: 'Check the status of all connected microservices',
  })
  async getServiceStatus() {
    return await this.healthService.checkServices();
  }
}