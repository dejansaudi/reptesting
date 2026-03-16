/**
 * PRICING_TIERS — plan definitions with features
 */
export const PRICING_TIERS = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        label: 'Free Forever',
        features: [
            'All 7 validation stages',
            '45+ framework fields',
            'AI Coach (bring your own key)',
            'Quality scoring & gate criteria',
            'XP & gamification',
            'Offline & mobile ready',
        ],
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 19,
        label: '$19/mo',
        features: [
            'Everything in Free',
            'Export to PDF & pitch summary',
            'AI market research (coming soon)',
            'Version snapshots & history',
            'Interview question templates',
            'Priority support',
        ],
        cta: 'Upgrade to Pro',
    },
    team: {
        id: 'team',
        name: 'Team',
        price: 49,
        label: '$49/mo',
        features: [
            'Everything in Pro',
            'Team collaboration (up to 5)',
            'Shared workspace',
            'Portfolio dashboard',
            'White-label reports',
            'Dedicated onboarding',
        ],
        cta: 'Start Team Plan',
    },
};
/**
 * TIER_LIMITS — resource limits per plan
 */
export const TIER_LIMITS = {
    free: { maxProjects: 1, maxSnapshots: 5, maxBranches: 1 },
    pro: { maxProjects: 5, maxSnapshots: 50, maxBranches: 10 },
    team: { maxProjects: Infinity, maxSnapshots: Infinity, maxBranches: Infinity },
};
//# sourceMappingURL=pricing.js.map