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
var RateLimitMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitMiddleware = void 0;
const common_1 = require("@nestjs/common");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
let RateLimitMiddleware = RateLimitMiddleware_1 = class RateLimitMiddleware {
    logger = new common_1.Logger(RateLimitMiddleware_1.name);
    generalLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 100,
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
    authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000,
        max: 20,
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
    graphLimiter = (0, express_rate_limit_1.default)({
        windowMs: 5 * 60 * 1000,
        max: 50,
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
    use(req, res, next) {
        if (req.url.startsWith('/api/auth/')) {
            this.authLimiter(req, res, next);
        }
        else if (req.url.startsWith('/api/graph/')) {
            this.graphLimiter(req, res, next);
        }
        else {
            this.generalLimiter(req, res, next);
        }
    }
};
exports.RateLimitMiddleware = RateLimitMiddleware;
exports.RateLimitMiddleware = RateLimitMiddleware = RateLimitMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], RateLimitMiddleware);
//# sourceMappingURL=rate-limit.middleware.js.map