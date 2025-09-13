import type { NextFunction, Request, Response } from 'express';
import { ProxyService } from './proxy.service';
export declare class ProxyController {
    private readonly proxyService;
    constructor(proxyService: ProxyService);
    proxyToAuth(req: Request, res: Response, next: NextFunction): void;
    proxyToUsers(req: Request, res: Response, next: NextFunction): void;
    proxyToGraph(req: Request, res: Response, next: NextFunction): void;
    proxyToSearch(req: Request, res: Response, next: NextFunction): void;
    proxyToIngestion(req: Request, res: Response, next: NextFunction): void;
}
