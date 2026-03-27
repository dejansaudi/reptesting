/** Pricing plan tiers */
export type Plan = 'free' | 'pro' | 'team';
/** Team member roles */
export type TeamRole = 'OWNER' | 'EDITOR' | 'VIEWER';
/** User profile */
export interface User {
    id: string;
    email: string;
    displayName: string;
    plan: Plan;
    teamRole?: TeamRole;
    avatarUrl?: string;
    createdAt: string;
}
//# sourceMappingURL=user.d.ts.map