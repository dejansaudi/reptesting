import { ConfigService } from '@nestjs/config';
interface StripeCustomer {
    id: string;
    email: string;
}
interface StripeCheckoutSession {
    id: string;
    url: string | null;
}
interface StripePortalSession {
    id: string;
    url: string;
}
interface StripeEvent {
    type: string;
    data: {
        object: Record<string, unknown>;
    };
}
interface CheckoutParams {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}
export declare class StripeService {
    private readonly configService;
    private stripe;
    constructor(configService: ConfigService);
    createCustomer(email: string, name?: string): Promise<StripeCustomer>;
    createCheckoutSession(params: CheckoutParams): Promise<StripeCheckoutSession>;
    createPortalSession(customerId: string, returnUrl: string): Promise<StripePortalSession>;
    verifyWebhookSignature(rawBody: Buffer, signature: string, webhookSecret: string): StripeEvent;
}
export {};
