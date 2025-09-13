import { Injectable, Logger } from '@nestjs/common';
import { createProxyMiddleware, RequestHandler } from 'http-proxy-middleware';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  // Users Service 프록시 (인증 관련)
  createUsersProxy(): RequestHandler {
    const target = process.env.USERS_SERVICE_URL || 'http://localhost:3001';
    this.logger.log(`Creating Users proxy to: ${target}`);
    
    return createProxyMiddleware({
      target,
      changeOrigin: true,
      timeout: 30000, // 30초 타임아웃
      proxyTimeout: 30000, // 프록시 타임아웃
      pathRewrite: {
        '^/api/auth': '/auth',
        '^/api/users': '',
      },
      onProxyReq: (proxyReq, req, res) => {
        this.logger.log(`Proxying to Users: ${req.method} ${req.path} -> ${target}${proxyReq.path}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        this.logger.log(`Users response: ${proxyRes.statusCode} for ${req.path}`);
      },
      onError: (err, req, res) => {
        this.logger.error(`Proxy error to Users service: ${err.message}`);
        if (!res.headersSent) {
          res.status(502).json({ error: 'Bad Gateway', message: 'Users service unavailable' });
        }
      },
    });
  }

  // Graph Service 프록시 (지식 그래프 관련)
  createGraphProxy(): RequestHandler {
    const target = process.env.GRAPH_SERVICE_URL || 'http://localhost:3002';
    this.logger.log(`Creating Graph proxy to: ${target}`);
    
    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: {
        '^/api/graph': '/api/graph',
      },
    });
  }

  // Search Service 프록시 (검색 관련) - 추후 구현
  createSearchProxy(): RequestHandler {
    const target = process.env.SEARCH_SERVICE_URL || 'http://localhost:3003';
    this.logger.log(`Creating Search proxy to: ${target}`);
    
    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: {
        '^/api/search': '/api/search',
      },
    });
  }

  // Ingestion Service 프록시 (데이터 수집 관련) - 추후 구현
  createIngestionProxy(): RequestHandler {
    const target = process.env.INGESTION_SERVICE_URL || 'http://localhost:3004';
    this.logger.log(`Creating Ingestion proxy to: ${target}`);
    
    return createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: {
        '^/api/ingestion': '/api/ingestion',
      },
    });
  }
}