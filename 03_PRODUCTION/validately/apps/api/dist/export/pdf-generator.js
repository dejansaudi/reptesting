"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProjectPdf = generateProjectPdf;
const pdfkit_1 = require("pdfkit");
const shared_1 = require("@validately/shared");
const BRAND = '#3b82f6';
const TEXT = '#1a1a2e';
const TEXT2 = '#64748b';
const GREEN = '#23a559';
const RED = '#f23f43';
const ORANGE = '#f47b67';
const FIELD_LABELS = {
    startup_name: 'Startup Name',
    problem_statement: 'Problem Statement',
    who_has_problem: 'Target Customer',
    contrarian_bet: 'Contrarian Bet',
    why_now: 'Why Now',
    tam_sam_som: 'TAM / SAM / SOM',
    unfair_advantage: 'Unfair Advantage',
    assumptions: 'Key Assumptions',
    pain_level: 'Pain Level',
    interviews_count: 'Customer Interviews',
    verbatim_quotes: 'Verbatim Quotes',
    persona_primary: 'Primary Persona',
    top_pains: 'Top Customer Pains',
    competitor_matrix: 'Competitive Landscape',
    core_problem: 'Core Problem',
    value_prop: 'Value Proposition',
    must_have: 'Must-Have Features',
    not_building: 'Not Building',
    pmf_score: 'PMF Score',
    retention_d7: 'D7 Retention',
    ltv_cac_ratio: 'LTV:CAC Ratio',
    revenue_model: 'Revenue Model',
    pmf_verdict: 'PMF Verdict',
    beachhead_segment: 'Beachhead Segment',
    omtm: 'One Metric That Matters',
    primary_channel: 'Primary Channel',
    pricing_model: 'Pricing Model',
    first_10_customers: 'First 10 Customers',
    sales_playbook: 'Sales Playbook',
    gross_margin: 'Gross Margin',
    team_plan: 'Team Plan',
    arr_mrr: 'ARR / MRR',
    thiel_moat: 'Competitive Moat',
    vision_10yr: '10-Year Vision',
    company_purpose: 'Company Purpose',
    exit_strategy: 'Exit Strategy',
};
const STAGE_FIELDS = {
    0: ['startup_name', 'problem_statement', 'who_has_problem', 'contrarian_bet', 'why_now', 'tam_sam_som', 'unfair_advantage', 'assumptions', 'pain_level'],
    1: ['interviews_count', 'verbatim_quotes', 'persona_primary', 'top_pains', 'competitor_matrix'],
    2: ['core_problem', 'value_prop', 'must_have', 'not_building'],
    3: ['pmf_score', 'retention_d7', 'ltv_cac_ratio', 'revenue_model', 'pmf_verdict'],
    4: ['beachhead_segment', 'omtm', 'primary_channel', 'pricing_model', 'first_10_customers'],
    5: ['sales_playbook', 'gross_margin', 'team_plan'],
    6: ['arr_mrr', 'thiel_moat', 'vision_10yr', 'company_purpose', 'exit_strategy'],
};
function generateProjectPdf(projectName, data) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({
            size: 'A4',
            margins: { top: 60, bottom: 60, left: 50, right: 50 },
            info: {
                Title: `${projectName} — Investor Report`,
                Author: 'Validately',
            },
        });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        const pageWidth = doc.page.width - 100;
        doc.fontSize(28).fillColor(BRAND).text('Validately', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(16).fillColor(TEXT).text(projectName, { align: 'center' });
        doc.moveDown(0.2);
        doc.fontSize(10).fillColor(TEXT2).text('Investor Readiness Report', { align: 'center' });
        doc.moveDown(0.2);
        doc.fontSize(9).fillColor(TEXT2).text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), { align: 'center' });
        doc.moveDown(1.5);
        const irs = (0, shared_1.calcIRS)(data);
        doc.fontSize(14).fillColor(TEXT).text('Investor Readiness Score', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(36).fillColor(irs.bandColor).text(`${irs.score} / ${irs.maxScore}`, { align: 'center' });
        doc.fontSize(12).fillColor(TEXT2).text(`${irs.band} — ${irs.pct}% complete`, { align: 'center' });
        doc.moveDown(1);
        for (const s of irs.stages) {
            const meta = shared_1.STAGE_META[s.stage];
            const barY = doc.y;
            doc.fontSize(9).fillColor(TEXT).text(`${meta.phase}`, 50, barY, { width: 80 });
            doc.rect(135, barY + 2, pageWidth - 85, 10).fillColor('#e5e7eb').fill();
            if (s.pct > 0) {
                doc.rect(135, barY + 2, ((pageWidth - 85) * s.pct) / 100, 10).fillColor(meta.color).fill();
            }
            doc.fontSize(8).fillColor(TEXT2).text(`${s.pct}%`, pageWidth + 10, barY + 1);
            doc.y = barY + 18;
        }
        const xv = (0, shared_1.runXV)(data);
        doc.moveDown(1);
        doc.fontSize(14).fillColor(TEXT).text('Cross-Validation Issues', { underline: true });
        doc.moveDown(0.3);
        if (xv.issues.length === 0) {
            doc.fontSize(10).fillColor(GREEN).text('All cross-validation checks passed.');
        }
        else {
            doc.fontSize(9).fillColor(TEXT2).text(`${xv.errors} errors, ${xv.warnings} warnings`);
            doc.moveDown(0.3);
            for (const issue of xv.issues.slice(0, 10)) {
                const color = issue.severity === 'error' ? RED : ORANGE;
                const prefix = issue.severity === 'error' ? 'ERROR' : 'WARN';
                doc.fontSize(9).fillColor(color).text(`[${prefix}] ${issue.msg}`, { indent: 10 });
            }
            if (xv.issues.length > 10) {
                doc.fontSize(9).fillColor(TEXT2).text(`... and ${xv.issues.length - 10} more issues`);
            }
        }
        for (let i = 0; i < 7; i++) {
            const meta = shared_1.STAGE_META[i];
            const fields = STAGE_FIELDS[i] || [];
            const gateResults = (0, shared_1.validateGate)(i, data);
            const allPassed = gateResults.every((r) => r.pass);
            doc.addPage();
            doc.fontSize(16).fillColor(meta.color).text(`Stage ${i}: ${meta.phase}`);
            doc.moveDown(0.2);
            doc.fontSize(9).fillColor(TEXT2).text(meta.tagline);
            doc.moveDown(0.3);
            const gateColor = allPassed ? GREEN : RED;
            const gateText = allPassed ? 'GATE PASSED' : `GATE OPEN — ${gateResults.filter((r) => !r.pass).length} criteria remaining`;
            doc.fontSize(10).fillColor(gateColor).text(gateText);
            doc.moveDown(0.5);
            for (const field of fields) {
                const label = FIELD_LABELS[field] || field;
                const value = data[field];
                if (!value)
                    continue;
                doc.fontSize(10).fillColor(BRAND).text(label, { underline: false });
                doc.moveDown(0.1);
                const displayValue = value.length > 500 ? value.slice(0, 500) + '...' : value;
                doc.fontSize(9).fillColor(TEXT).text(displayValue, { indent: 10 });
                doc.moveDown(0.5);
                if (doc.y > doc.page.height - 100) {
                    doc.addPage();
                }
            }
        }
        doc.addPage();
        doc.fontSize(12).fillColor(TEXT).text('Generated by Validately', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(9).fillColor(TEXT2).text('This report was auto-generated from your validation data. ' +
            'Share it with investors, mentors, and advisors to demonstrate traction.', { align: 'center' });
        doc.end();
    });
}
//# sourceMappingURL=pdf-generator.js.map