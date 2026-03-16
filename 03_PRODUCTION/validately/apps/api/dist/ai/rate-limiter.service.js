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
exports.RateLimiterService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
const PLAN_LIMITS = {
    FREE: 0,
    PRO: 100,
    TEAM: 500,
};
let RateLimiterService = class RateLimiterService {
    constructor(configService) {
        this.configService = configService;
        this.redis = null;
        const redisUrl = this.configService.get('REDIS_URL');
        if (redisUrl) {
            this.redis = new ioredis_1.default(redisUrl, {
                maxRetriesPerRequest: 3,
                lazyConnect: true,
            });
        }
    }
    async checkAndIncrement(user) {
        const limit = PLAN_LIMITS[user.plan] ?? 0;
        if (limit === 0) {
            throw new common_1.ForbiddenException('Hosted AI is not available on the Free plan. ' +
                'Please upgrade to Pro or Team, or use your own API key (BYOK).');
        }
        if (!this.redis) {
            console.warn('Redis not configured — rate limiting disabled');
            return;
        }
        const key = this.getRateLimitKey(user.id);
        const current = await this.redis.get(key);
        const count = current ? parseInt(current, 10) : 0;
        if (count >= limit) {
            throw new common_1.ForbiddenException(`Daily AI request limit reached (${limit}/${limit}). ` +
                `Your ${user.plan} plan allows ${limit} requests per day. ` +
                'Limits reset at midnight UTC.');
        }
        const multi = this.redis.multi();
        multi.incr(key);
        if (count === 0) {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setUTCDate(midnight.getUTCDate() + 1);
            midnight.setUTCHours(0, 0, 0, 0);
            const ttlSeconds = Math.ceil((midnight.getTime() - now.getTime()) / 1000);
            multi.expire(key, ttlSeconds);
        }
        await multi.exec();
    }
    async getUsage(userId) {
        if (!this.redis) {
            return { used: 0, limit: 0, remaining: 0, resetsAt: new Date().toISOString() };
        }
        const key = this.getRateLimitKey(userId);
        const current = await this.redis.get(key);
        const used = current ? parseInt(current, 10) : 0;
        const now = new Date();
        const midnight = new Date(now);
        midnight.setUTCDate(midnight.getUTCDate() + 1);
        midnight.setUTCHours(0, 0, 0, 0);
        return {
            used,
            limit: 0,
            remaining: 0,
            resetsAt: midnight.toISOString(),
        };
    }
    getRateLimitKey(userId) {
        const today = new Date().toISOString().split('T')[0];
        return `ai:ratelimit:${userId}:${today}`;
    }
};
exports.RateLimiterService = RateLimiterService;
exports.RateLimiterService = RateLimiterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RateLimiterService);
//# sourceMappingURL=rate-limiter.service.js.map