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
var AppConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppConfigService = AppConfigService_1 = class AppConfigService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(AppConfigService_1.name);
    }
    onModuleInit() {
        this.validateRequired();
        this.logOptional();
    }
    get databaseUrl() {
        return this.config.getOrThrow('DATABASE_URL');
    }
    get jwtSecret() {
        return this.config.getOrThrow('JWT_SECRET');
    }
    get nextAuthSecret() {
        return this.config.get('NEXTAUTH_SECRET') || this.jwtSecret;
    }
    get anthropicApiKey() {
        return this.config.get('ANTHROPIC_API_KEY');
    }
    get hasAnthropicKey() {
        return !!this.anthropicApiKey;
    }
    get stripeSecretKey() {
        return this.config.get('STRIPE_SECRET_KEY');
    }
    get stripeWebhookSecret() {
        return this.config.get('STRIPE_WEBHOOK_SECRET');
    }
    get stripeProPriceId() {
        return this.config.get('STRIPE_PRO_PRICE_ID');
    }
    get stripeTeamPriceId() {
        return this.config.get('STRIPE_TEAM_PRICE_ID');
    }
    get hasStripe() {
        return !!this.stripeSecretKey;
    }
    get redisUrl() {
        return this.config.get('REDIS_URL');
    }
    get hasRedis() {
        return !!this.redisUrl;
    }
    get appUrl() {
        return this.config.get('NEXTAUTH_URL') || 'http://localhost:3000';
    }
    get apiPort() {
        return parseInt(this.config.get('PORT') || '4000', 10);
    }
    get corsOrigin() {
        return this.config.get('CORS_ORIGIN') || this.appUrl;
    }
    get resendApiKey() {
        return this.config.get('RESEND_API_KEY');
    }
    get r2AccountId() {
        return this.config.get('R2_ACCOUNT_ID');
    }
    get sentryDsn() {
        return this.config.get('SENTRY_DSN');
    }
    get encryptionSecret() {
        return this.config.get('ENCRYPTION_SECRET');
    }
    validateRequired() {
        const required = ['DATABASE_URL', 'JWT_SECRET'];
        const missing = required.filter((key) => !this.config.get(key));
        if (missing.length > 0) {
            const msg = `Missing required environment variables: ${missing.join(', ')}`;
            this.logger.error(msg);
            throw new Error(msg);
        }
        this.logger.log('All required environment variables are set');
    }
    logOptional() {
        const optional = [
            ['ANTHROPIC_API_KEY', 'AI features (platform key)'],
            ['STRIPE_SECRET_KEY', 'Stripe billing'],
            ['STRIPE_WEBHOOK_SECRET', 'Stripe webhooks'],
            ['STRIPE_PRO_PRICE_ID', 'Pro plan checkout'],
            ['REDIS_URL', 'Rate limiting & job queues'],
            ['RESEND_API_KEY', 'Transactional email'],
            ['GOOGLE_CLIENT_ID', 'Google OAuth'],
        ];
        const missing = optional.filter(([key]) => !this.config.get(key));
        if (missing.length > 0) {
            this.logger.warn(`Optional env vars not set (features disabled): ${missing.map(([, label]) => label).join(', ')}`);
        }
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = AppConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppConfigService);
//# sourceMappingURL=app-config.service.js.map