import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class RateLimitMiddleware implements NestMiddleware {
    private readonly logger;
    private generalLimiter;
    private authLimiter;
    private graphLimiter;
    use(req: Request, res: Response, next: NextFunction): void;
}
