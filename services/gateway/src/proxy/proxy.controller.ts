import { All, Controller, Next, Req, Res } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  // Users/Auth Service 프록시
  @All('api/auth/*')
  proxyToAuth(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const proxy = this.proxyService.createUsersProxy();
    proxy(req, res, next);
  }

  @All('api/users/*')
  proxyToUsers(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const proxy = this.proxyService.createUsersProxy();
    proxy(req, res, next);
  }

  // Graph Service 프록시
  @All('api/graph/*')
  proxyToGraph(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const proxy = this.proxyService.createGraphProxy();
    proxy(req, res, next);
  }

  // Search Service 프록시 (추후 구현)
  @All('api/search/*')
  proxyToSearch(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const proxy = this.proxyService.createSearchProxy();
    proxy(req, res, next);
  }

  // Ingestion Service 프록시 (추후 구현)
  @All('api/ingestion/*')
  proxyToIngestion(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const proxy = this.proxyService.createIngestionProxy();
    proxy(req, res, next);
  }
}