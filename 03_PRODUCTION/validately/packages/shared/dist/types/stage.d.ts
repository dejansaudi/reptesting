import type { ProjectData } from './project';
/** The 7 validation stages */
export type StageId = 0 | 1 | 2 | 3 | 4 | 5 | 6;
/** Stage metadata (icon, color, phase name, tagline) */
export interface StageMeta {
    id: StageId;
    phase: string;
    icon: string;
    color: string;
    tagline: string;
}
/** A single gate criterion for stage advancement */
export interface GateCriteria {
    field: keyof ProjectData;
    msg: string;
    check: string;
}
/** Result of checking a single gate criterion */
export interface GateCheckResult extends GateCriteria {
    pass: boolean;
}
/** Assessment item from cross-validation */
export interface AssessItem {
    vcheck: string;
    stage: StageId;
    msg: string;
    severity: 'warning' | 'error';
}
//# sourceMappingURL=stage.d.ts.map