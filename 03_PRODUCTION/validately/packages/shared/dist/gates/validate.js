import { GATE_CRITERIA } from './criteria';
/**
 * checkGateCriterion — Check if a single gate criterion passes for given data.
 * Supports: "required", "minLength:N", "minValue:N", "maxValue:N"
 */
export function checkGateCriterion(criterion, data) {
    const val = data[criterion.field] || '';
    if (criterion.check === 'required') {
        return val.length > 0;
    }
    if (criterion.check.startsWith('minLength:')) {
        const min = parseInt(criterion.check.split(':')[1]) || 0;
        return String(val).length >= min;
    }
    if (criterion.check.startsWith('minValue:')) {
        const min = parseFloat(criterion.check.split(':')[1]) || 0;
        return (parseFloat(val) || 0) >= min;
    }
    if (criterion.check.startsWith('maxValue:')) {
        const max = parseFloat(criterion.check.split(':')[1]) || Infinity;
        const num = parseFloat(String(val));
        return String(val).length > 0 && !isNaN(num) && num <= max;
    }
    return false;
}
/**
 * validateGate — Check all gate criteria for a given stage.
 * Returns array of GateCheckResult with pass/fail for each criterion.
 */
export function validateGate(stageId, data) {
    const criteria = GATE_CRITERIA[stageId] || [];
    return criteria.map((c) => ({
        ...c,
        pass: checkGateCriterion(c, data),
    }));
}
/**
 * isGatePassed — Returns true if all criteria for a stage are met.
 */
export function isGatePassed(stageId, data) {
    const results = validateGate(stageId, data);
    return results.length > 0 && results.every((r) => r.pass);
}
//# sourceMappingURL=validate.js.map