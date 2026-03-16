/**
 * Quality score result
 * t = total (0-100%), s = specificity (0-4), e = evidence (0-4), a = actionability (0-4)
 */
export interface QScoreResult {
    t: number;
    s: number;
    e: number;
    a: number;
}
/**
 * qScore — Quality scoring function (specificity, evidence, actionability)
 * Evaluates how well a field answer demonstrates real validation work.
 */
export declare function qScore(v: string | undefined | null): QScoreResult;
/**
 * qScoreMulti — Average quality score across multiple fields.
 * Skips empty fields; returns 0 if all empty.
 */
export declare function qScoreMulti(values: (string | undefined | null)[]): QScoreResult;
//# sourceMappingURL=qScore.d.ts.map