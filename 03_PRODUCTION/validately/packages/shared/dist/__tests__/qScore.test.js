import { describe, it, expect } from 'vitest';
import { qScore, qScoreMulti } from '../scoring/qScore';
describe('qScore', () => {
    it('returns zero for empty/null/undefined input', () => {
        expect(qScore('')).toEqual({ t: 0, s: 0, e: 0, a: 0 });
        expect(qScore(null)).toEqual({ t: 0, s: 0, e: 0, a: 0 });
        expect(qScore(undefined)).toEqual({ t: 0, s: 0, e: 0, a: 0 });
        expect(qScore('   ')).toEqual({ t: 0, s: 0, e: 0, a: 0 });
    });
    it('short vague text scores low', () => {
        const result = qScore('Good idea');
        expect(result.t).toBeLessThan(25);
        expect(result.s).toBeLessThan(2);
    });
    it('longer text increases specificity', () => {
        const short = qScore('A thing');
        const medium = qScore('A'.repeat(65));
        const long = qScore('A'.repeat(125));
        expect(medium.s).toBeGreaterThan(short.s);
        expect(long.s).toBeGreaterThan(medium.s);
    });
    it('numbers and currency boost evidence score', () => {
        const withNumbers = qScore('We have 500 users paying $50/month');
        expect(withNumbers.e).toBeGreaterThanOrEqual(2);
    });
    it('evidence keywords boost evidence score', () => {
        const withEvidence = qScore('Our survey of 200 customers showed 60% NPS');
        expect(withEvidence.e).toBeGreaterThanOrEqual(3);
    });
    it('action words boost actionability', () => {
        const actionable = qScore('We will launch in Q1 and test with 50 users next month');
        expect(actionable.a).toBeGreaterThanOrEqual(2);
    });
    it('milestone keywords boost actionability', () => {
        const milestones = qScore('First step is to build MVP, then test with beta users next sprint');
        expect(milestones.a).toBeGreaterThanOrEqual(3);
    });
    it('buzzwords penalize specificity', () => {
        const buzzy = qScore('We are a revolutionary game-changer that will disrupt the paradigm with synergy');
        const clean = qScore('We reduce manual data entry by 80% for accounting teams using OCR');
        expect(clean.s).toBeGreaterThan(buzzy.s);
    });
    it('structured list format boosts specificity', () => {
        const structured = qScore('Key points:\n- Revenue: $10k MRR\n- Users: 200\n- Growth: 15% m/m');
        expect(structured.s).toBeGreaterThanOrEqual(3);
    });
    it('total score is percentage of max (s+e+a out of 12)', () => {
        const result = qScore('We interviewed 30 customers. 85% said they would pay $99/month. Plan to launch beta next month.');
        // s+e+a should be reasonably high, t = round((s+e+a)/12 * 100)
        expect(result.t).toBe(Math.round(((result.s + result.e + result.a) / 12) * 100));
    });
    it('all dimensions cap at 4', () => {
        const maxed = qScore('We interviewed 500 customers in a survey experiment with $100k revenue, ' +
            '200 users, 50% conversion, NPS of 80, will launch next month in sprint 2, ' +
            'first step is to build then test specific features with exact 1000 benchmarks\n' +
            '- item 1\n- item 2');
        expect(maxed.s).toBeLessThanOrEqual(4);
        expect(maxed.e).toBeLessThanOrEqual(4);
        expect(maxed.a).toBeLessThanOrEqual(4);
    });
});
describe('qScoreMulti', () => {
    it('returns zero for all empty values', () => {
        expect(qScoreMulti(['', null, undefined])).toEqual({ t: 0, s: 0, e: 0, a: 0 });
    });
    it('returns zero for empty array', () => {
        expect(qScoreMulti([])).toEqual({ t: 0, s: 0, e: 0, a: 0 });
    });
    it('averages scores across non-empty fields', () => {
        const result = qScoreMulti([
            'We have 200 users paying $50/month with 80% retention',
            'Our 30 interviews revealed 3 key pain points',
        ]);
        expect(result.t).toBeGreaterThan(0);
    });
    it('ignores empty fields in average', () => {
        const withEmpty = qScoreMulti(['Good text with 100 users', '', null, undefined]);
        const withoutEmpty = qScoreMulti(['Good text with 100 users']);
        expect(withEmpty.t).toBe(withoutEmpty.t);
    });
});
//# sourceMappingURL=qScore.test.js.map