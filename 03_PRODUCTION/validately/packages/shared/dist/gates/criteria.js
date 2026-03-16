/**
 * GATE_CRITERIA — 7 arrays of gate requirements, one per stage.
 * Each criterion specifies a field, message, and check type.
 */
export const GATE_CRITERIA = {
    // Stage 0 — DIAGNOSE
    0: [
        { field: 'startup_name', msg: 'Startup name required', check: 'required' },
        { field: 'problem_statement', msg: 'Problem statement required (50+ chars)', check: 'minLength:50' },
        { field: 'who_has_problem', msg: 'Target customer required', check: 'required' },
        { field: 'why_now', msg: 'Why now timing required', check: 'required' },
        { field: 'tam_sam_som', msg: 'TAM/SAM/SOM required', check: 'required' },
        { field: 'unfair_advantage', msg: 'Unfair advantage required', check: 'required' },
        { field: 'assumptions', msg: 'Key assumptions required', check: 'required' },
        { field: 'pain_level', msg: 'Pain level selection required', check: 'required' },
    ],
    // Stage 1 — DISCOVER
    1: [
        { field: 'interviews_count', msg: '15+ interviews required', check: 'minValue:15' },
        { field: 'verbatim_quotes', msg: 'Verbatim quotes required', check: 'required' },
        { field: 'persona_primary', msg: 'Primary persona required', check: 'required' },
        { field: 'top_pains', msg: 'Top pains required', check: 'required' },
        { field: 'competitor_matrix', msg: 'Competitor matrix required', check: 'required' },
    ],
    // Stage 2 — DEFINE
    2: [
        { field: 'core_problem', msg: 'Core problem required', check: 'required' },
        { field: 'value_prop', msg: 'Value prop required', check: 'required' },
        { field: 'must_have', msg: 'Must-have features required', check: 'required' },
        { field: 'not_building', msg: 'Not building list required', check: 'required' },
    ],
    // Stage 3 — VALIDATE
    3: [
        { field: 'pmf_score', msg: 'PMF score required (\u226540%)', check: 'minValue:40' },
        { field: 'cac', msg: 'CAC required', check: 'required' },
        { field: 'ltv', msg: 'LTV required', check: 'required' },
        { field: 'ltv_cac_ratio', msg: 'LTV:CAC ratio required (\u22653)', check: 'minValue:3' },
        { field: 'revenue_model', msg: 'Revenue model required', check: 'required' },
        { field: 'pmf_verdict', msg: 'PMF verdict required', check: 'required' },
    ],
    // Stage 4 — IGNITE
    4: [
        { field: 'beachhead_segment', msg: 'Beachhead segment required', check: 'required' },
        { field: 'omtm', msg: 'OMTM required', check: 'required' },
        { field: 'primary_channel', msg: 'Primary channel required', check: 'required' },
        { field: 'pricing_model', msg: 'Pricing model required', check: 'required' },
        { field: 'first_10_customers', msg: 'First 10 customers plan required', check: 'required' },
        { field: 'get_strategy', msg: 'GET (acquisition) strategy required', check: 'required' },
        { field: 'keep_strategy', msg: 'KEEP (retention) strategy required', check: 'required' },
    ],
    // Stage 5 — DEPLOY
    5: [
        { field: 'sales_playbook', msg: 'Sales playbook required', check: 'required' },
        { field: 'sales_cycle', msg: 'Sales cycle required (\u226460 days)', check: 'maxValue:60' },
        { field: 'team_plan', msg: 'Team plan required (50+ chars)', check: 'minLength:50' },
        { field: 'expansion_revenue', msg: 'Expansion revenue goal required', check: 'required' },
        { field: 'gross_margin', msg: 'Gross margin required (\u226550%)', check: 'minValue:50' },
        { field: 'current_phase', msg: 'Startup phase selection required', check: 'required' },
        { field: 'omtm_metric', msg: 'OMTM metric required', check: 'required' },
    ],
    // Stage 6 — DOMINATE
    6: [
        { field: 'arr_mrr', msg: 'ARR/MRR required', check: 'required' },
        { field: 'analytics_maturity', msg: 'Analytics maturity level required', check: 'required' },
        { field: 'thiel_moat', msg: 'Thiel moat required (80+ chars)', check: 'minLength:80' },
        { field: 'vision_10yr', msg: '10-year vision required', check: 'required' },
        { field: 'company_purpose', msg: 'Company purpose required', check: 'required' },
        { field: 'thiel_engineering', msg: 'Thiel Engineering score required', check: 'required' },
        { field: 'thiel_timing', msg: 'Thiel Timing score required', check: 'required' },
    ],
};
//# sourceMappingURL=criteria.js.map