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
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = require("@anthropic-ai/sdk");
const app_config_service_1 = require("../config/app-config.service");
const rate_limiter_service_1 = require("./rate-limiter.service");
const users_service_1 = require("../users/users.service");
const ai_prompts_1 = require("./ai.prompts");
let AiService = class AiService {
    constructor(appConfig, rateLimiter, usersService) {
        this.appConfig = appConfig;
        this.rateLimiter = rateLimiter;
        this.usersService = usersService;
    }
    async chat(user, message, context) {
        const client = await this.getClient(user);
        await this.rateLimiter.checkAndIncrement(user);
        const sanitizedMessage = this.sanitizeInput(message);
        const prompt = (0, ai_prompts_1.buildChatPrompt)(sanitizedMessage, context);
        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: this.getMaxTokens(user.plan),
            system: ai_prompts_1.AI_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: prompt }],
        });
        const text = this.extractText(response);
        return {
            content: text,
            usage: await this.rateLimiter.getUsage(user.id, user.plan),
        };
    }
    async startResearch(user, query, projectId) {
        const client = await this.getClient(user);
        await this.rateLimiter.checkAndIncrement(user);
        const sanitizedQuery = this.sanitizeInput(query);
        const prompt = (0, ai_prompts_1.buildResearchPrompt)(sanitizedQuery);
        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: this.getMaxTokens(user.plan),
            system: ai_prompts_1.AI_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: prompt }],
        });
        const text = this.extractText(response);
        return {
            result: text,
            status: 'completed',
            usage: await this.rateLimiter.getUsage(user.id, user.plan),
        };
    }
    async reviewField(user, fieldKey, fieldValue, projectData) {
        const client = await this.getClient(user);
        await this.rateLimiter.checkAndIncrement(user);
        const sanitizedValue = this.sanitizeInput(fieldValue);
        const prompt = (0, ai_prompts_1.buildReviewPrompt)(fieldKey, sanitizedValue, projectData);
        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: this.getMaxTokens(user.plan),
            system: ai_prompts_1.AI_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: prompt }],
        });
        const text = this.extractText(response);
        return {
            fieldKey,
            feedback: text,
            usage: await this.rateLimiter.getUsage(user.id, user.plan),
        };
    }
    async getJobStatus(jobId) {
        return {
            jobId,
            status: 'completed',
            message: 'Research runs synchronously in MVP',
        };
    }
    async getUsage(user) {
        return this.rateLimiter.getUsage(user.id, user.plan);
    }
    async getClient(user) {
        if (user.encryptedApiKey) {
            const apiKey = this.usersService.getDecryptedApiKey(user.encryptedApiKey);
            return new sdk_1.default({ apiKey });
        }
        if (this.appConfig.hasAnthropicKey) {
            return new sdk_1.default({ apiKey: this.appConfig.anthropicApiKey });
        }
        throw new common_1.ForbiddenException('No API key available. Add your Anthropic API key in Settings, ' +
            'or upgrade to Pro/Team to use the platform key.');
    }
    getMaxTokens(plan) {
        switch (plan) {
            case 'TEAM':
                return 2000;
            case 'PRO':
                return 1000;
            default:
                return 500;
        }
    }
    extractText(response) {
        const block = response.content[0];
        if (!block || block.type !== 'text')
            return '';
        return block.text ?? '';
    }
    sanitizeInput(input) {
        let sanitized = input
            .replace(/```[\s\S]*?```/g, '')
            .replace(/system:/gi, '')
            .replace(/\[INST\]/gi, '')
            .replace(/<\|.*?\|>/g, '')
            .trim();
        if (sanitized.length > 4000) {
            sanitized = sanitized.slice(0, 4000);
        }
        return sanitized;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService,
        rate_limiter_service_1.RateLimiterService,
        users_service_1.UsersService])
], AiService);
//# sourceMappingURL=ai.service.js.map