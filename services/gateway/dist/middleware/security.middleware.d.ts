import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class SecurityMiddleware implements NestMiddleware {
    private readonly logger;
    private helmetMiddleware;
    use(req: Request, res: Response, next: NextFunction): void;
    private performSecurityChecks;
}
