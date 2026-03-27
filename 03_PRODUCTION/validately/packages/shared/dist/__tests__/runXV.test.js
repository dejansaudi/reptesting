import { describe, it, expect } from 'vitest';
import { runXV, VCHECKS } from '../scoring/runXV';
describe('runXV', () => {
    it('returns all issues for empty data', () => {
        const result = runXV({});
        expect(result.passed).toBe(false);
        expect(result.errors).toBeGreaterThan(0);
        expect(result.warnings).toBeGreaterThan(0);
        expect(result.issues.length).toBe(result.errors + result.warnings);
    });
    it('each issue has required fields', () => {
        const result = runXV({});
        for (const issue of result.issues) {
            expect(issue.vcheck).toBeDefined();
            expect(issue.stage).toBeDefined();
            expect(issue.msg).toBeTruthy();
            expect(['error', 'warning']).toContain(issue.severity);
        }
    });
    it('problem statement check fails for short text', () => {
        const result = runXV({ problem_statement: 'Too short' });
        const v1 = result.issues.find((i) => i.vcheck === 'v1');
        expect(v1).toBeDefined();
        expect(v1?.severity).toBe('error');
    });
    it('problem statement check passes for 50+ chars', () => {
        const result = runXV({ problem_statement: 'A'.repeat(60) });
        const v1 = result.issues.find((i) => i.vcheck === 'v1');
        expect(v1).toBeUndefined(); // No issue = passed
    });
    it('detects "everyone" as target customer', () => {
        const result = runXV({ who_has_problem: 'Everyone needs this' });
        const v17 = result.issues.find((i) => i.vcheck === 'v17');
        expect(v17).toBeDefined();
        expect(v17?.severity).toBe('error');
    });
    it('passes specific target customer', () => {
        const result = runXV({ who_has_problem: 'B2B SaaS CTOs at Series A startups' });
        const v17 = result.issues.find((i) => i.vcheck === 'v17');
        expect(v17).toBeUndefined();
    });
    it('interviews below 15 is an error', () => {
        const result = runXV({ interviews_count: '10' });
        const v2 = result.issues.find((i) => i.vcheck === 'v2');
        expect(v2).toBeDefined();
        expect(v2?.severity).toBe('error');
    });
    it('interviews at 15+ passes', () => {
        const result = runXV({ interviews_count: '15' });
        const v2 = result.issues.find((i) => i.vcheck === 'v2');
        expect(v2).toBeUndefined();
    });
    it('PMF below 40 is a deal-breaker', () => {
        const result = runXV({ pmf_score: '30' });
        const v4 = result.issues.find((i) => i.vcheck === 'v4');
        expect(v4).toBeDefined();
        expect(v4?.severity).toBe('error');
    });
    it('LTV:CAC below 3 is a deal-breaker', () => {
        const result = runXV({ ltv_cac_ratio: '2' });
        const v5 = result.issues.find((i) => i.vcheck === 'v5');
        expect(v5).toBeDefined();
        expect(v5?.severity).toBe('error');
    });
    it('gross margin below 50% is a deal-breaker', () => {
        const result = runXV({ gross_margin: '40' });
        const v7 = result.issues.find((i) => i.vcheck === 'v7');
        expect(v7).toBeDefined();
        expect(v7?.severity).toBe('error');
    });
    it('company purpose too short is an error', () => {
        const result = runXV({ company_purpose: 'Short' });
        const v16 = result.issues.find((i) => i.vcheck === 'v16');
        expect(v16).toBeDefined();
        expect(v16?.severity).toBe('error');
    });
});
describe('VCHECKS', () => {
    it('has checks covering all 7 stages', () => {
        const coveredStages = new Set(VCHECKS.map((v) => v.stage));
        for (let i = 0; i < 7; i++) {
            expect(coveredStages.has(i)).toBe(true);
        }
    });
    it('each check has required properties', () => {
        for (const v of VCHECKS) {
            expect(v.id).toBeTruthy();
            expect(v.field).toBeTruthy();
            expect(v.severity).toMatch(/^(error|warning)$/);
            expect(typeof v.check).toBe('function');
            expect(v.msg).toBeTruthy();
        }
    });
});
//# sourceMappingURL=runXV.test.js.map