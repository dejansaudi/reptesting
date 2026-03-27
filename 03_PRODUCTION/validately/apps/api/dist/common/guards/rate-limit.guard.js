"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitGuard = exports.SkipRateLimit = exports.RateLimit = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const RATE_LIMIT_KEY = 'rateLimit';
const RateLimit = (config) => (0, common_1.SetMetadata)(RATE_LIMIT_KEY, config);
exports.RateLimit = RateLimit;
const SkipRateLimit = () => (0, common_1.SetMetadata)(RATE_LIMIT_KEY, { windowMs: 0, max: Infinity });
exports.SkipRateLimit = SkipRateLimit;
let RateLimitGuard = class RateLimitGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.buckets = new Map();
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60_000);
    }
    onModuleDestroy() {
        clearInterval(this.cleanupInterval);
    }
    canActivate(context) {
        const config = this.reflector.getAllAndOverride(RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);
        if (config && config.max === Infinity)
            return true;
        const windowMs = config?.windowMs ?? 60_000;
        const max = config?.max ?? 100;
        const req = context.switchToHttp().getRequest();
        const key = this.getKey(req);
        const now = Date.now();
        let bucket = this.buckets.get(key);
        if (!bucket || now >= bucket.resetAt) {
            bucket = { count: 0, resetAt: now + windowMs };
            this.buckets.set(key, bucket);
        }
        bucket.count++;
        const res = context.switchToHttp().getResponse();
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - bucket.count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetAt / 1000));
        if (bucket.count > max) {
            res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
            throw new common_1.HttpException({
                statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                error: 'Too Many Requests',
                message: `Rate limit exceeded. Try again in ${Math.ceil((bucket.resetAt - now) / 1000)}s.`,
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        return true;
    }
    getKey(req) {
        const userId = req.user?.id;
        if (userId)
            return `user:${userId}`;
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        return `ip:${ip}`;
    }
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.buckets) {
            if (now >= entry.resetAt) {
                this.buckets.delete(key);
            }
        }
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map