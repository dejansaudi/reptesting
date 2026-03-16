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
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const app_config_service_1 = require("../config/app-config.service");
const stripe_1 = require("stripe");
let StripeService = class StripeService {
    constructor(appConfig) {
        this.appConfig = appConfig;
        this.stripe = null;
    }
    onModuleInit() {
        if (this.appConfig.stripeSecretKey) {
            this.stripe = new stripe_1.default(this.appConfig.stripeSecretKey, {
                apiVersion: '2026-02-25.clover',
            });
        }
    }
    getStripe() {
        if (!this.stripe) {
            throw new common_1.BadRequestException('Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.');
        }
        return this.stripe;
    }
    async createCustomer(email, name) {
        return this.getStripe().customers.create({ email, name });
    }
    async createCheckoutSession(params) {
        return this.getStripe().checkout.sessions.create({
            customer: params.customerId,
            mode: 'subscription',
            line_items: [{ price: params.priceId, quantity: 1 }],
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            metadata: params.metadata,
        });
    }
    async createPortalSession(customerId, returnUrl) {
        return this.getStripe().billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
    }
    verifyWebhookSignature(rawBody, signature, webhookSecret) {
        return this.getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map