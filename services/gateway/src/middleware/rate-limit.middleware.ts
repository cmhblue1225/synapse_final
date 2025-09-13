import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);

  // 일반 API 요청 제한
  private generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100, // 최대 100개 요청
    message: {
      error: 'Too Many Requests',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      this.logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes',
      });
    },
  });

  // 인증 관련 요청 제한 (더 엄격)
  private authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 20, // 최대 20개 요청
    message: {
      error: 'Too Many Authentication Attempts',
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      this.logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too Many Authentication Attempts',
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes',
      });
    },
  });

  // 그래프 API 요청 제한 (계산 집약적)
  private graphLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5분
    max: 50, // 최대 50개 요청
    message: {
      error: 'Too Many Graph Requests',
      message: 'Too many graph requests, please try again later.',
      retryAfter: '5 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      this.logger.warn(`Graph rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too Many Graph Requests',
        message: 'Too many graph requests, please try again later.',
        retryAfter: '5 minutes',
      });
    },
  });

  use(req: Request, res: Response, next: NextFunction) {
    // URL에 따라 다른 rate limiter 적용
    if (req.url.startsWith('/api/auth/')) {
      this.authLimiter(req, res, next);
    } else if (req.url.startsWith('/api/graph/')) {
      this.graphLimiter(req, res, next);
    } else {
      this.generalLimiter(req, res, next);
    }
  }
}