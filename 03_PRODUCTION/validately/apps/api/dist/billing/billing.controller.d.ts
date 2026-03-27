import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { User } from '@validately/db';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    createCheckout(user: User): Promise<{
        url: string | null;
    }>;
    createPortal(user: User): Promise<{
        url: string;
    }>;
    getStatus(user: User): Promise<{
        plan: import("@validately/db").$Enums.Plan;
        stripeCustomerId: string | null;
        hasActiveSubscription: boolean;
    }>;
    handleWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}
