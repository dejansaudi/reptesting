import { describe, it, expect } from 'vitest';
import { calcIRS } from '../scoring/calcIRS';
describe('calcIRS', () => {
    it('returns zero score for empty data', () => {
        const result = calcIRS({});
        expect(result.score).toBe(0);
        expect(result.pct).toBe(0);
        expect(result.band).toBe('Pre-Seed');
        expect(result.maxScore).toBe(820);
        expect(result.stages).toHaveLength(7);
    });
    it('handles null/undefined data gracefully', () => {
        expect(calcIRS(null).score).toBe(0);
        expect(calcIRS(undefined).score).toBe(0);
        expect(calcIRS('bad').score).toBe(0);
    });
    it('increases score when stage 0 fields are filled', () => {
        const data = {
            startup_name: 'TestCo',
            problem_statement: 'A'.repeat(60), // minLength:50
            who_has_problem: 'SMBs in healthcare',
            why_now: 'AI advancements enable this now',
            tam_sam_som: '$5B TAM',
            unfair_advantage: 'Domain expertise',
            assumptions: 'SMBs will pay for automation',
            pain_level: 'high',
        };
        const result = calcIRS(data);
        expect(result.score).toBeGreaterThan(0);
        expect(result.stages[0].passed).toBe(8); // all 8 stage 0 criteria
        expect(result.stages[0].pct).toBe(100);
    });
    it('computes per-stage weighted scores', () => {
        const result = calcIRS({ startup_name: 'X' });
        // Stage 0 has 8 criteria, startup_name alone passes 1
        expect(result.stages[0].passed).toBe(1);
        expect(result.stages[0].total).toBe(8);
        expect(result.stages[0].pct).toBe(13); // 1/8 = 12.5 → 13
    });
    it('assigns correct bands based on score ranges', () => {
        // With no data → Pre-Seed
        expect(calcIRS({}).band).toBe('Pre-Seed');
    });
    it('maxScore is sum of all stage weights (820)', () => {
        const result = calcIRS({});
        expect(result.maxScore).toBe(820);
        // 120+120+110+130+110+110+120 = 820
    });
    it('full project data approaches high score', () => {
        // Create data that passes most criteria
        const fullData = {
            startup_name: 'TestCo',
            problem_statement: 'A'.repeat(60),
            who_has_problem: 'SMBs',
            why_now: 'Now',
            tam_sam_som: '$5B',
            unfair_advantage: 'Deep tech',
            assumptions: 'Will pay',
            pain_level: 'high',
            interviews_count: '20',
            verbatim_quotes: 'Yes',
            persona_primary: 'CTO',
            top_pains: 'Pain1',
            competitor_matrix: 'Grid',
            core_problem: 'Core',
            value_prop: 'Value',
            must_have: 'Feature1',
            not_building: 'Feature2',
            pmf_score: '50',
            cac: '100',
            ltv: '500',
            ltv_cac_ratio: '5',
            revenue_model: 'SaaS',
            pmf_verdict: 'Go',
            beachhead_segment: 'Enterprise',
            omtm: 'MRR',
            primary_channel: 'Direct',
            pricing_model: 'Subscription',
            first_10_customers: 'Named list of 10 customers',
            get_strategy: 'Outbound + content marketing',
            keep_strategy: 'Onboarding + support',
            sales_playbook: 'Playbook',
            sales_cycle: '30',
            team_plan: 'A'.repeat(60),
            expansion_revenue: '20%',
            gross_margin: '70',
            current_phase: 'Scale',
            omtm_metric: 'MRR',
            arr_mrr: '$100k',
            analytics_maturity: 'Advanced',
            thiel_moat: 'A'.repeat(90),
            vision_10yr: 'Long term vision here',
            company_purpose: 'To transform healthcare',
            thiel_engineering: '8',
            thiel_timing: '7',
        };
        const result = calcIRS(fullData);
        expect(result.score).toBeGreaterThan(600);
        expect(result.pct).toBeGreaterThan(70);
    });
});
//# sourceMappingURL=calcIRS.test.js.map