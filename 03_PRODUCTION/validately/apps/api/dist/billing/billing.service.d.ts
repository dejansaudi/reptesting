import { ConfigService } from '@nestjs/config';
import { User } from '@validately/db';
import { StripeService } from './stripe.service';
export declare class BillingService {
    private readonly stripeService;
    private readonly configService;
    private prisma;
    constructor(stripeService: StripeService, configService: ConfigService);
    createCheckoutSession(user: User): Promise<{
        url: string | null;
    }>;
    createPortalSession(user: User): Promise<{
        url: string;
    }>;
    getSubscriptionStatus(user: User): Promise<{
        plan: import("@validately/db").$Enums.Plan;
        stripeCustomerId: string | null;
        hasActiveSubscription: boolean;
    }>;
    handleWebhook(rawBody: Buffer, signature: string): Promise<{
        received: boolean;
    }>;
}
