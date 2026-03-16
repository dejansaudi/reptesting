import type { ProjectData } from '../types/project';
import type { StageId } from '../types/stage';
/** Per-stage score breakdown */
export interface StageScore {
    stage: StageId;
    passed: number;
    total: number;
    pct: number;
    weighted: number;
    maxWeight: number;
}
/** IRS result — Investor Readiness Score */
export interface IRSResult {
    score: number;
    maxScore: number;
    pct: number;
    band: string;
    bandColor: string;
    stages: StageScore[];
}
/**
 * calcIRS — Investor Readiness Score calculator
 * Weights gate completion across all 7 stages.
 * Returns overall score + per-stage breakdown.
 */
export declare function calcIRS(data: Partial<ProjectData>): IRSResult;
//# sourceMappingURL=calcIRS.d.ts.map