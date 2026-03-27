import type { ProjectData } from '../types/project';
import type { StageId, AssessItem } from '../types/stage';
/**
 * VCheck — a single cross-validation check
 */
export interface VCheck {
    id: string;
    stage: StageId;
    field: keyof ProjectData;
    severity: 'error' | 'warning';
    check: (d: Partial<ProjectData>) => boolean;
    msg: string;
}
/**
 * Cross-validation result
 */
export interface XVResult {
    passed: boolean;
    errors: number;
    warnings: number;
    issues: AssessItem[];
}
/**
 * VCHECKS — cross-validation checks for investor readiness.
 * Errors = deal-breakers. Warnings = improvement areas.
 */
export declare const VCHECKS: VCheck[];
/**
 * runXV — Cross-validation across all stages
 * Runs all VCHECKS against project data and returns issues with severity counts.
 */
export declare function runXV(data: Partial<ProjectData>): XVResult;
//# sourceMappingURL=runXV.d.ts.map