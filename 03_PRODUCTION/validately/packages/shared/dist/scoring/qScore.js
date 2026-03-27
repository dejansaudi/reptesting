/** Buzzwords that signal shallow thinking — penalize specificity */
const BUZZWORDS = /\b(everyone|disrupt|synergy|revolutionary|game.?changer|world.?class|best.?in.?class|leverage|paradigm)\b/gi;
/** Evidence markers — signs the founder did real research */
const EVIDENCE_RE = /\b(interview|survey|data|research|tested|experiment|usability|cohort|A\/B|benchmark|NPS)\b/i;
/** Quantitative markers */
const QUANT_RE = /\d+([%x]|\s*(users|customers|interviews|responses|conversions|sign.?ups))/i;
/**
 * qScore — Quality scoring function (specificity, evidence, actionability)
 * Evaluates how well a field answer demonstrates real validation work.
 */
export function qScore(v) {
    if (!v || !v.trim())
        return { t: 0, s: 0, e: 0, a: 0 };
    const x = v.trim();
    let s = 0;
    let e = 0;
    let a = 0;
    // ── Specificity ──────────────────────────────────────
    if (x.length > 20)
        s++;
    if (x.length > 60)
        s++;
    if (x.length > 120)
        s++;
    if (/specific|exact|\d/.test(x))
        s++;
    // Bonus for structured answers (lists, bullets, paragraphs)
    if (/[\n•\-\*]\s/.test(x))
        s++;
    // Penalty for buzzwords (progressive: -1 for any, -2 for 3+)
    const buzzCount = (x.match(BUZZWORDS) || []).length;
    if (buzzCount >= 3)
        s = Math.max(0, s - 2);
    else if (buzzCount >= 1)
        s = Math.max(0, s - 1);
    s = Math.min(4, s);
    // ── Evidence ─────────────────────────────────────────
    if (/\d/.test(x))
        e++;
    if (/\$|€|£/.test(x))
        e++;
    if (QUANT_RE.test(x))
        e++;
    if (EVIDENCE_RE.test(x))
        e++;
    e = Math.min(4, e);
    // ── Actionability ────────────────────────────────────
    if (/will|plan|test|launch|build|ship|implement/i.test(x))
        a++;
    if (/week|month|day|quarter|sprint/i.test(x))
        a++;
    if (x.length > 40)
        a++;
    if (/step|first|then|next|phase|milestone/i.test(x))
        a++;
    a = Math.min(4, a);
    return { t: Math.round(((s + e + a) / 12) * 100), s, e, a };
}
/**
 * qScoreMulti — Average quality score across multiple fields.
 * Skips empty fields; returns 0 if all empty.
 */
export function qScoreMulti(values) {
    const results = values.map(qScore).filter((r) => r.t > 0);
    if (results.length === 0)
        return { t: 0, s: 0, e: 0, a: 0 };
    const avg = (key) => Math.round(results.reduce((sum, r) => sum + r[key], 0) / results.length);
    return { t: avg('t'), s: avg('s'), e: avg('e'), a: avg('a') };
}
//# sourceMappingURL=qScore.js.map