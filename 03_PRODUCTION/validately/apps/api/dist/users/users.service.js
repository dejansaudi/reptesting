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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const app_config_service_1 = require("../config/app-config.service");
const prisma_service_1 = require("../common/prisma.service");
const crypto = require("crypto");
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
let UsersService = class UsersService {
    constructor(appConfig, prismaService) {
        this.appConfig = appConfig;
        this.prismaService = prismaService;
    }
    get prisma() {
        return this.prismaService.client;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                plan: true,
                onboardingComplete: true,
                createdAt: true,
                encryptedApiKey: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const { encryptedApiKey, ...rest } = user;
        return { ...rest, hasApiKey: !!encryptedApiKey };
    }
    async updateProfile(userId, data) {
        const update = {};
        if (data.name !== undefined)
            update.name = data.name;
        if (data.onboardingComplete !== undefined)
            update.onboardingComplete = data.onboardingComplete;
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: update,
            select: { id: true, email: true, name: true, plan: true, onboardingComplete: true },
        });
        return user;
    }
    async updateApiKey(userId, apiKey) {
        const encrypted = this.encrypt(apiKey);
        await this.prisma.user.update({
            where: { id: userId },
            data: { encryptedApiKey: encrypted },
        });
        return { success: true };
    }
    async removeApiKey(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { encryptedApiKey: null },
        });
        return { success: true };
    }
    getDecryptedApiKey(encryptedApiKey) {
        return this.decrypt(encryptedApiKey);
    }
    getEncryptionKey() {
        const secret = this.appConfig.encryptionSecret || this.appConfig.jwtSecret;
        return crypto.createHash('sha256').update(secret).digest();
    }
    encrypt(text) {
        const key = this.getEncryptionKey();
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    }
    decrypt(data) {
        if (!data || typeof data !== 'string') {
            throw new common_1.InternalServerErrorException('Malformed encrypted data');
        }
        const parts = data.split(':');
        if (parts.length !== 3) {
            throw new common_1.InternalServerErrorException('Malformed encrypted data');
        }
        const [ivHex, tagHex, ciphertext] = parts;
        // Validate hex format before attempting decryption
        const hexRe = /^[0-9a-f]+$/i;
        if (!hexRe.test(ivHex) || !hexRe.test(tagHex) || !hexRe.test(ciphertext)) {
            throw new common_1.InternalServerErrorException('Malformed encrypted data');
        }
        try {
            const key = this.getEncryptionKey();
            const iv = Buffer.from(ivHex, 'hex');
            const tag = Buffer.from(tagHex, 'hex');
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            decipher.setAuthTag(tag);
            let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch {
            throw new common_1.InternalServerErrorException('Failed to decrypt API key');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService,
        prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map