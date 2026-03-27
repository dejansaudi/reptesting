import type { ProjectData } from '../types/project';
import type { GateCriteria, GateCheckResult, StageId } from '../types/stage';
/**
 * checkGateCriterion — Check if a single gate criterion passes for given data.
 * Supports: "required", "minLength:N", "minValue:N", "maxValue:N"
 */
export declare function checkGateCriterion(criterion: GateCriteria, data: Partial<ProjectData>): boolean;
/**
 * validateGate — Check all gate criteria for a given stage.
 * Returns array of GateCheckResult with pass/fail for each criterion.
 */
export declare function validateGate(stageId: StageId, data: Partial<ProjectData>): GateCheckResult[];
/**
 * isGatePassed — Returns true if all criteria for a stage are met.
 */
export declare function isGatePassed(stageId: StageId, data: Partial<ProjectData>): boolean;
//# sourceMappingURL=validate.d.ts.map