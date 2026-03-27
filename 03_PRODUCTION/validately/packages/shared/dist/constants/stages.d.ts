import type { StageMeta } from '../types/stage';
/**
 * STAGE_META — 7 validation stages with metadata
 */
export declare const STAGE_META: StageMeta[];
/** XP level thresholds */
export interface XPLevel {
    lv: number;
    n: string;
    xp: number;
    ic: string;
    c: string;
}
/**
 * LVS — XP levels array
 */
export declare const LVS: XPLevel[];
/** Get current level for given XP */
export declare function getLv(xp: number): XPLevel;
/** Get next level for given XP (null if max) */
export declare function getNxt(xp: number): XPLevel | null;
//# sourceMappingURL=stages.d.ts.map