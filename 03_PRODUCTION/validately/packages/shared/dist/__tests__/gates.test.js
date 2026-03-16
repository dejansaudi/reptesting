import { describe, it, expect } from 'vitest';
import { checkGateCriterion, validateGate, isGatePassed } from '../gates/validate';
import { GATE_CRITERIA } from '../gates/criteria';
describe('checkGateCriterion', () => {
    it('required: passes when field has value', () => {
        const criterion = { field: 'startup_name', msg: 'test', check: 'required' };
        expect(checkGateCriterion(criterion, { startup_name: 'TestCo' })).toBe(true);
        expect(checkGateCriterion(criterion, { startup_name: '' })).toBe(false);
        expect(checkGateCriterion(criterion, {})).toBe(false);
    });
    it('minLength: passes when field meets minimum', () => {
        const criterion = { field: 'problem_statement', msg: 'test', check: 'minLength:50' };
        expect(checkGateCriterion(criterion, { problem_statement: 'A'.repeat(50) })).toBe(true);
        expect(checkGateCriterion(criterion, { problem_statement: 'A'.repeat(49) })).toBe(false);
        expect(checkGateCriterion(criterion, {})).toBe(false);
    });
    it('minValue: passes when numeric value meets minimum', () => {
        const criterion = { field: 'pmf_score', msg: 'test', check: 'minValue:40' };
        expect(checkGateCriterion(criterion, { pmf_score: '50' })).toBe(true);
        expect(checkGateCriterion(criterion, { pmf_score: '40' })).toBe(true);
        expect(checkGateCriterion(criterion, { pmf_score: '39' })).toBe(false);
        expect(checkGateCriterion(criterion, {})).toBe(false);
    });
    it('maxValue: passes when numeric value is at or below max', () => {
        const criterion = { field: 'sales_cycle', msg: 'test', check: 'maxValue:60' };
        expect(checkGateCriterion(criterion, { sales_cycle: '30' })).toBe(true);
        expect(checkGateCriterion(criterion, { sales_cycle: '60' })).toBe(true);
        expect(checkGateCriterion(criterion, { sales_cycle: '90' })).toBe(false);
        expect(checkGateCriterion(criterion, {})).toBe(false);
    });
    it('unknown check type returns false', () => {
        const criterion = { field: 'startup_name', msg: 'test', check: 'unknown:5' };
        expect(checkGateCriterion(criterion, { startup_name: 'Test' })).toBe(false);
    });
});
describe('validateGate', () => {
    it('returns results for all criteria in a stage', () => {
        const results = validateGate(0, {});
        expect(results).toHaveLength(GATE_CRITERIA[0].length);
        expect(results.every((r) => 'pass' in r)).toBe(true);
    });
    it('marks passing criteria correctly', () => {
        const results = validateGate(0, { startup_name: 'TestCo' });
        const nameResult = results.find((r) => r.field === 'startup_name');
        expect(nameResult?.pass).toBe(true);
    });
    it('marks failing criteria correctly', () => {
        const results = validateGate(0, {});
        expect(results.every((r) => r.pass === false)).toBe(true);
    });
});
describe('isGatePassed', () => {
    it('returns false when no data provided', () => {
        expect(isGatePassed(0, {})).toBe(false);
    });
    it('returns true when all stage 0 criteria met', () => {
        const data = {
            startup_name: 'TestCo',
            problem_statement: 'A'.repeat(60),
            who_has_problem: 'SMBs',
            why_now: 'AI is ready',
            tam_sam_som: '$5B',
            unfair_advantage: 'Tech moat',
            assumptions: 'Will pay',
            pain_level: 'high',
        };
        expect(isGatePassed(0, data)).toBe(true);
    });
    it('returns false when one criterion fails', () => {
        const data = {
            startup_name: 'TestCo',
            problem_statement: 'Short', // needs 50+ chars
            who_has_problem: 'SMBs',
            why_now: 'Now',
            tam_sam_som: '$5B',
            unfair_advantage: 'Tech',
            assumptions: 'Yes',
            pain_level: 'high',
        };
        expect(isGatePassed(0, data)).toBe(false);
    });
});
describe('GATE_CRITERIA', () => {
    it('has criteria for all 7 stages', () => {
        for (let i = 0; i < 7; i++) {
            expect(GATE_CRITERIA[i]).toBeDefined();
            expect(GATE_CRITERIA[i].length).toBeGreaterThan(0);
        }
    });
    it('each criterion has field, msg, and check', () => {
        for (let i = 0; i < 7; i++) {
            for (const c of GATE_CRITERIA[i]) {
                expect(c.field).toBeDefined();
                expect(c.msg).toBeDefined();
                expect(c.check).toBeDefined();
            }
        }
    });
});
//# sourceMappingURL=gates.test.js.map