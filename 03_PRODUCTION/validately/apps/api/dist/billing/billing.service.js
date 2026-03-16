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
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const app_config_service_1 = require("../config/app-config.service");
const stripe_service_1 = require("./stripe.service");
const prisma_service_1 = require("../common/prisma.service");
let BillingService = class BillingService {
    constructor(stripeService, appConfig, prismaService) {
        this.stripeService = stripeService;
        this.appConfig = appConfig;
        this.prismaService = prismaService;
    }
    get prisma() {
        return this.prismaService.client;
    }
    async createCheckoutSession(user) {
        const priceId = this.appConfig.stripeProPriceId;
        if (!priceId) {
            throw new common_1.InternalServerErrorException('Stripe price ID not configured');
        }
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripeService.createCustomer(user.email, user.name || undefined);
            customerId = customer.id;
            await this.prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customerId },
            });
        }
        const session = await this.stripeService.createCheckoutSession({
            customerId,
            priceId,
            successUrl: `${this.appConfig.appUrl}/settings/billing?success=true`,
            cancelUrl: `${this.appConfig.appUrl}/settings/billing?canceled=true`,
            metadata: { userId: user.id },
        });
        return { url: session.url };
    }
    async createPortalSession(user) {
        if (!user.stripeCustomerId) {
            throw new common_1.BadRequestException('No billing account found. Subscribe first.');
        }
        const session = await this.stripeService.createPortalSession(user.stripeCustomerId, `${this.appConfig.appUrl}/settings/billing`);
        return { url: session.url };
    }
    async getSubscriptionStatus(user) {
        return {
            plan: user.plan,
            stripeCustomerId: user.stripeCustomerId,
            hasActiveSubscription: user.plan !== 'FREE',
        };
    }
    async handleWebhook(rawBody, signature) {
        const webhookSecret = this.appConfig.stripeWebhookSecret;
        if (!webhookSecret) {
            throw new common_1.InternalServerErrorException('Stripe webhook secret not configured');
        }
        const event = this.stripeService.verifyWebhookSignature(rawBody, signature, webhookSecret);
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata?.userId;
                if (userId) {
                    await this.prisma.user.update({
                        where: { id: userId },
                        data: { plan: 'PRO' },
                    });
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                const customerId = typeof subscription.customer === 'string'
                    ? subscription.customer
                    : undefined;
                if (customerId) {
                    await this.prisma.user.updateMany({
                        where: { stripeCustomerId: customerId },
                        data: { plan: 'FREE' },
                    });
                }
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const customerId = typeof invoice.customer === 'string' ? invoice.customer : undefined;
                if (customerId) {
                    console.warn(`Payment failed for customer: ${customerId}`);
                }
                break;
            }
            default:
                break;
        }
        return { received: true };
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        app_config_service_1.AppConfigService,
        prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map