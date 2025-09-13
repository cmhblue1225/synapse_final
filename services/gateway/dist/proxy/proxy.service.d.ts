import { RequestHandler } from 'http-proxy-middleware';
export declare class ProxyService {
    private readonly logger;
    createUsersProxy(): RequestHandler;
    createGraphProxy(): RequestHandler;
    createSearchProxy(): RequestHandler;
    createIngestionProxy(): RequestHandler;
}
