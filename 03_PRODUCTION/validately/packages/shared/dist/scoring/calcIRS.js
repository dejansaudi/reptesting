import { GATE_CRITERIA } from '../gates/criteria';
import { checkGateCriterion } from '../gates/validate';
/** Stage weights for IRS calculation */
const WEIGHTS = {
    0: 120, // Diagnose
    1: 120, // Discover
    2: 110, // Define
    3: 130, // Validate (highest — PMF is critical)
    4: 110, // Ignite
    5: 110, // Deploy
    6: 120, // Dominate
};
const BANDS = [
    { min: 500, band: 'Late-Stage', color: '#23a559' },
    { min: 400, band: 'Growth', color: '#57d163' },
    { min: 300, band: 'Series A', color: '#f0b232' },
    { min: 200, band: 'Seed', color: '#f47b67' },
    { min: 100, band: 'MVP', color: '#f47b67' },
    { min: 0, band: 'Pre-Seed', color: '#f23f43' },
];
/**
 * calcIRS — Investor Readiness Score calculator
 * Weights gate completion across all 7 stages.
 * Returns overall score + per-stage breakdown.
 */
export function calcIRS(data) {
    const maxScore = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
    if (!data || typeof data !== 'object') {
        return {
            score: 0,
            maxScore,
            pct: 0,
            band: 'Pre-Seed',
            bandColor: '#f23f43',
            stages: [],
        };
    }
    const stages = [];
    let score = 0;
    for (let i = 0; i < 7; i++) {
        const stageId = i;
        const criteria = GATE_CRITERIA[stageId] || [];
        let passed = 0;
        for (const c of criteria) {
            if (checkGateCriterion(c, data))
                passed++;
        }
        const weighted = criteria.length > 0
            ? (passed / criteria.length) * WEIGHTS[stageId]
            : 0;
        stages.push({
            stage: stageId,
            passed,
            total: criteria.length,
            pct: criteria.length > 0 ? Math.round((passed / criteria.length) * 100) : 0,
            weighted: Math.round(weighted),
            maxWeight: WEIGHTS[stageId],
        });
        score += weighted;
    }
    const { band, color: bandColor } = BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1];
    return {
        score: Math.round(score),
        maxScore,
        pct: Math.round((score / maxScore) * 100),
        band,
        bandColor,
        stages,
    };
}
//# sourceMappingURL=calcIRS.js.map