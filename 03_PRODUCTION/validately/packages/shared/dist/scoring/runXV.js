/**
 * VCHECKS — cross-validation checks for investor readiness.
 * Errors = deal-breakers. Warnings = improvement areas.
 */
export const VCHECKS = [
    // Stage 0 — Diagnose
    { id: 'v1', stage: 0, field: 'problem_statement', severity: 'error', check: (d) => (d.problem_statement || '').length >= 50, msg: 'Problem statement needs more depth (50+ chars)' },
    { id: 'v17', stage: 0, field: 'who_has_problem', severity: 'error', check: (d) => !/everyone|all people|anybody/i.test(d.who_has_problem || ''), msg: '"Everyone" is not a target customer — be specific' },
    { id: 'v18', stage: 0, field: 'tam_sam_som', severity: 'warning', check: (d) => /\d/.test(d.tam_sam_som || ''), msg: 'TAM/SAM/SOM should include numbers, not just descriptions' },
    // Stage 1 — Discover
    { id: 'v2', stage: 1, field: 'interviews_count', severity: 'error', check: (d) => parseInt(d.interviews_count || '0') >= 15, msg: 'Minimum 15 customer interviews required' },
    { id: 'v19', stage: 1, field: 'verbatim_quotes', severity: 'warning', check: (d) => ((d.verbatim_quotes || '').match(/"/g) || []).length >= 4, msg: 'Include at least 2 actual verbatim quotes (in quotation marks)' },
    // Stage 2 — Define
    { id: 'v3', stage: 2, field: 'must_have', severity: 'warning', check: (d) => ((d.must_have || '').match(/\n/g) || []).length <= 2, msg: 'Maximum 3 features for v1!' },
    { id: 'v20', stage: 2, field: 'not_building', severity: 'warning', check: (d) => (d.not_building || '').length >= 20, msg: '"Not building" list should be substantial — what are you saying no to?' },
    // Stage 3 — Validate (errors = deal-breakers for investors)
    { id: 'v4', stage: 3, field: 'pmf_score', severity: 'error', check: (d) => parseFloat(d.pmf_score || '0') >= 40, msg: "PMF score below 40% — you don't have product-market fit" },
    { id: 'v5', stage: 3, field: 'ltv_cac_ratio', severity: 'error', check: (d) => parseFloat(d.ltv_cac_ratio || '0') >= 3, msg: 'LTV:CAC below 3:1 — unsustainable unit economics' },
    { id: 'v6', stage: 3, field: 'retention_d7', severity: 'error', check: (d) => parseFloat(d.retention_d7 || '0') >= 20, msg: "Day-7 retention below 20% — users aren't coming back" },
    { id: 'v21', stage: 3, field: 'cac', severity: 'warning', check: (d) => /\d/.test(d.cac || ''), msg: 'CAC should be a specific number, not a description' },
    // Stage 4 — Ignite
    { id: 'v11', stage: 4, field: 'get_strategy', severity: 'warning', check: (d) => (d.get_strategy || '').length >= 30, msg: 'GET strategy needs specifics — which channels, what budget?' },
    { id: 'v12', stage: 4, field: 'channel_cac', severity: 'warning', check: (d) => (d.channel_cac || '').length >= 10, msg: 'Channel CAC missing — you need cost per acquisition per channel' },
    { id: 'v22', stage: 4, field: 'first_10_customers', severity: 'warning', check: (d) => (d.first_10_customers || '').length >= 30, msg: "First 10 customers plan needs specifics — names, not hypotheticals" },
    // Stage 5 — Deploy
    { id: 'v7', stage: 5, field: 'gross_margin', severity: 'error', check: (d) => parseFloat(d.gross_margin || '0') >= 50, msg: 'Gross margin below 50% — not enough margin to sustain scaling' },
    { id: 'v8', stage: 5, field: 'sales_cycle', severity: 'warning', check: (d) => !d.sales_cycle || parseInt(d.sales_cycle) <= 60, msg: 'Sales cycle > 60 days — too long for repeatable scaling' },
    { id: 'v9', stage: 5, field: 'team_plan', severity: 'warning', check: (d) => (d.team_plan || '').length >= 50, msg: 'Team plan needs detail on roles, timing, ROI' },
    { id: 'v13', stage: 5, field: 'omtm_metric', severity: 'warning', check: (d) => (d.omtm_metric || '').length >= 3, msg: 'Define your One Metric That Matters' },
    { id: 'v14', stage: 5, field: 'experiment_backlog', severity: 'warning', check: (d) => (d.experiment_backlog || '').length >= 20, msg: 'Experiment backlog empty — what are you testing?' },
    // Stage 6 — Dominate
    { id: 'v10', stage: 6, field: 'thiel_moat', severity: 'error', check: (d) => (d.thiel_moat || '').length >= 80, msg: "Moat needs specifics — which of Thiel's 7 powers do you have?" },
    {
        id: 'v15',
        stage: 6,
        field: 'thiel_engineering',
        severity: 'warning',
        check: (d) => {
            const scores = [
                d.thiel_engineering,
                d.thiel_timing,
                d.thiel_monopoly,
                d.thiel_people,
                d.thiel_distribution,
                d.thiel_durability,
                d.thiel_secret,
            ];
            const filled = scores.filter((v) => parseInt(v || '0') > 0);
            if (filled.length === 0)
                return true; // not started yet — not a failure
            const avg = filled.reduce((s, v) => s + (parseInt(v || '0') || 0), 0) / 7;
            return avg >= 5;
        },
        msg: 'Thiel Scorecard average below 5/10 — weak moat. Which powers will you strengthen?',
    },
    { id: 'v16', stage: 6, field: 'company_purpose', severity: 'error', check: (d) => (d.company_purpose || '').length >= 20, msg: 'Company purpose too vague — why does this company exist?' },
    { id: 'v23', stage: 6, field: 'vision_10yr', severity: 'warning', check: (d) => (d.vision_10yr || '').length >= 30, msg: '10-year vision needs substance — where will this company be?' },
];
/**
 * runXV — Cross-validation across all stages
 * Runs all VCHECKS against project data and returns issues with severity counts.
 */
export function runXV(data) {
    const issues = [];
    for (const v of VCHECKS) {
        if (!v.check(data)) {
            issues.push({ vcheck: v.id, stage: v.stage, msg: v.msg, severity: v.severity });
        }
    }
    return {
        passed: issues.length === 0,
        errors: issues.filter((i) => i.severity === 'error').length,
        warnings: issues.filter((i) => i.severity === 'warning').length,
        issues,
    };
}
//# sourceMappingURL=runXV.js.map