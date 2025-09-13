import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  private helmetMiddleware = helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
    // Cross Origin Embedder Policy
    crossOriginEmbedderPolicy: false,
    // HSTS (HTTP Strict Transport Security)
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    // Referrer Policy
    referrerPolicy: {
      policy: 'same-origin',
    },
  });

  use(req: Request, res: Response, next: NextFunction) {
    // API 요청 로깅
    this.logger.log(`${req.method} ${req.url} - ${req.ip}`);

    // 보안 헤더 추가
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-Service', 'Synapse-Gateway');

    // Helmet 보안 미들웨어 적용
    this.helmetMiddleware(req, res, () => {
      // 추가 보안 체크
      this.performSecurityChecks(req, res);
      next();
    });
  }

  private performSecurityChecks(req: Request, res: Response) {
    // 의심스러운 User-Agent 차단
    const userAgent = req.headers['user-agent'] || '';
    const suspiciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /burp/i,
      /wget/i,
      /curl/i, // 일반적인 curl은 허용하되 의심스러운 패턴만 체크
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      this.logger.warn(`Suspicious User-Agent detected: ${userAgent} from ${req.ip}`);
    }

    // 대용량 요청 체크
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > 10 * 1024 * 1024) { // 10MB 제한
      this.logger.warn(`Large request detected: ${contentLength} bytes from ${req.ip}`);
    }

    // SQL Injection 패턴 기본 체크 (URL 파라미터)
    const url = req.url.toLowerCase();
    const sqlPatterns = [
      /union.*select/i,
      /insert.*into/i,
      /delete.*from/i,
      /drop.*table/i,
    ];

    if (sqlPatterns.some(pattern => pattern.test(url))) {
      this.logger.error(`Potential SQL injection attempt: ${req.url} from ${req.ip}`);
      res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by security policy',
      });
      return;
    }
  }
}