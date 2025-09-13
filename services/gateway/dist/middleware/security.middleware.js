"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var SecurityMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityMiddleware = void 0;
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
let SecurityMiddleware = SecurityMiddleware_1 = class SecurityMiddleware {
    logger = new common_1.Logger(SecurityMiddleware_1.name);
    helmetMiddleware = (0, helmet_1.default)({
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
        crossOriginEmbedderPolicy: false,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
        referrerPolicy: {
            policy: 'same-origin',
        },
    });
    use(req, res, next) {
        this.logger.log(`${req.method} ${req.url} - ${req.ip}`);
        res.setHeader('X-API-Version', '1.0.0');
        res.setHeader('X-Service', 'Synapse-Gateway');
        this.helmetMiddleware(req, res, () => {
            this.performSecurityChecks(req, res);
            next();
        });
    }
    performSecurityChecks(req, res) {
        const userAgent = req.headers['user-agent'] || '';
        const suspiciousPatterns = [
            /sqlmap/i,
            /nikto/i,
            /nmap/i,
            /burp/i,
            /wget/i,
            /curl/i,
        ];
        if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
            this.logger.warn(`Suspicious User-Agent detected: ${userAgent} from ${req.ip}`);
        }
        const contentLength = parseInt(req.headers['content-length'] || '0');
        if (contentLength > 10 * 1024 * 1024) {
            this.logger.warn(`Large request detected: ${contentLength} bytes from ${req.ip}`);
        }
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
};
exports.SecurityMiddleware = SecurityMiddleware;
exports.SecurityMiddleware = SecurityMiddleware = SecurityMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], SecurityMiddleware);
//# sourceMappingURL=security.middleware.js.map