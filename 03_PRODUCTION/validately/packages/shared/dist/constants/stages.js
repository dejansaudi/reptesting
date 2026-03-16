import { C } from './colors'; // C used for LVS level colors below
/**
 * STAGE_META — 7 validation stages with metadata
 */
export const STAGE_META = [
    { id: 0, phase: 'DIAGNOSE', icon: '\u{1FA7A}', color: '#3b82f6', tagline: 'You think you have a problem worth solving? Prove it.' },
    { id: 1, phase: 'DISCOVER', icon: '\u{1F52C}', color: '#10b981', tagline: 'Talk to real customers. Not your co-founder.' },
    { id: 2, phase: 'DEFINE', icon: '\u{1F3AF}', color: '#ec4899', tagline: 'Strip it down. Build less. Way less.' },
    { id: 3, phase: 'VALIDATE', icon: '\u{1F9EA}', color: '#a855f7', tagline: 'Does anyone actually want to pay for this?' },
    { id: 4, phase: 'IGNITE', icon: '\u{1F525}', color: '#f97316', tagline: 'Light the fire. One channel. One target market.' },
    { id: 5, phase: 'DEPLOY', icon: '\u2699\uFE0F', color: '#14b8a6', tagline: 'Systems, not heroics. Make it repeatable.' },
    { id: 6, phase: 'DOMINATE', icon: '\u{1F451}', color: '#f59e0b', tagline: 'Scale smart \u2014 only when the numbers say so.' },
];
/**
 * LVS — XP levels array
 */
export const LVS = [
    { lv: 1, n: 'Observer', xp: 0, ic: '\u{1F441}\uFE0F', c: C.text3 },
    { lv: 2, n: 'Explorer', xp: 200, ic: '\u{1F50D}', c: C.brand },
    { lv: 3, n: 'Builder', xp: 500, ic: '\u{1F528}', c: C.purple },
    { lv: 4, n: 'Validator', xp: 900, ic: '\u{1F52C}', c: C.pink },
    { lv: 5, n: 'Launcher', xp: 1400, ic: '\u{1F680}', c: C.orange },
];
/** Get current level for given XP */
export function getLv(xp) {
    let l = LVS[0];
    for (const v of LVS) {
        if (xp >= v.xp)
            l = v;
    }
    return l;
}
/** Get next level for given XP (null if max) */
export function getNxt(xp) {
    for (const l of LVS) {
        if (xp < l.xp)
            return l;
    }
    return null;
}
//# sourceMappingURL=stages.js.map