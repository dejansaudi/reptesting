import type { Plan } from '../types/user';
export interface PricingTier {
    id: Plan;
    name: string;
    price: number;
    label: string;
    features: string[];
    cta?: string;
}
/**
 * PRICING_TIERS — plan definitions with features
 */
export declare const PRICING_TIERS: Record<Plan, PricingTier>;
export interface TierLimit {
    maxProjects: number;
    maxSnapshots: number;
    maxBranches: number;
}
/**
 * TIER_LIMITS — resource limits per plan
 */
export declare const TIER_LIMITS: Record<Plan, TierLimit>;
//# sourceMappingURL=pricing.d.ts.map