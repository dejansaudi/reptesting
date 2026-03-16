"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePitchDeckPdf = generatePitchDeckPdf;
const pdfkit_1 = require("pdfkit");
const shared_1 = require("@validately/shared");
const BRAND = '#3b82f6';
const WHITE = '#ffffff';
const TEXT = '#1a1a2e';
const TEXT2 = '#64748b';
const SLIDES = [
    {
        title: '',
        bgColor: BRAND,
        content: (d) => [
            d.startup_name || 'Untitled Startup',
            '',
            d.problem_statement?.slice(0, 120) || '',
        ],
    },
    {
        title: 'The Problem',
        content: (d) => [
            d.problem_statement || '',
            '',
            d.who_has_problem ? `Who: ${d.who_has_problem}` : '',
            d.pain_level ? `Pain level: ${d.pain_level}/10` : '',
        ],
    },
    {
        title: 'Why Now',
        content: (d) => [
            d.why_now || '',
            '',
            d.contrarian_bet ? `Our contrarian bet: ${d.contrarian_bet}` : '',
        ],
    },
    {
        title: 'Market Opportunity',
        content: (d) => [
            d.tam_sam_som || '',
            '',
            d.beachhead_segment ? `Beachhead: ${d.beachhead_segment}` : '',
        ],
    },
    {
        title: 'Solution & Value Prop',
        content: (d) => [
            d.value_prop || '',
            '',
            d.must_have ? `Core features: ${d.must_have}` : '',
        ],
    },
    {
        title: 'Customer Discovery',
        content: (d) => [
            d.interviews_count ? `${d.interviews_count} customer interviews conducted` : '',
            '',
            d.persona_primary ? `Primary persona: ${d.persona_primary}` : '',
            '',
            d.top_pains ? `Top pains: ${d.top_pains}` : '',
        ],
    },
    {
        title: 'Traction & Validation',
        content: (d) => [
            d.pmf_score ? `PMF Score: ${d.pmf_score}%` : '',
            d.retention_d7 ? `D7 Retention: ${d.retention_d7}%` : '',
            d.ltv_cac_ratio ? `LTV:CAC Ratio: ${d.ltv_cac_ratio}x` : '',
            d.activation_rate ? `Activation: ${d.activation_rate}%` : '',
            '',
            d.pmf_verdict || '',
        ],
    },
    {
        title: 'Business Model',
        content: (d) => [
            d.revenue_model || '',
            '',
            d.pricing_model ? `Pricing: ${d.pricing_model}` : '',
            d.arr_mrr ? `Revenue: ${d.arr_mrr}` : '',
            d.gross_margin ? `Gross margin: ${d.gross_margin}%` : '',
        ],
    },
    {
        title: 'Go-to-Market',
        content: (d) => [
            d.primary_channel ? `Primary channel: ${d.primary_channel}` : '',
            d.get_strategy ? `Acquisition: ${d.get_strategy}` : '',
            d.keep_strategy ? `Retention: ${d.keep_strategy}` : '',
            d.grow_strategy ? `Expansion: ${d.grow_strategy}` : '',
        ],
    },
    {
        title: 'Competitive Moat',
        content: (d) => [
            d.unfair_advantage || '',
            '',
            d.thiel_moat || '',
        ],
    },
    {
        title: 'Vision',
        content: (d) => [
            d.vision_10yr || '',
            '',
            d.company_purpose ? `Purpose: ${d.company_purpose}` : '',
        ],
    },
];
function generatePitchDeckPdf(projectName, data) {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({
            size: 'A4',
            layout: 'landscape',
            margins: { top: 60, bottom: 60, left: 60, right: 60 },
            info: {
                Title: `${projectName} — Pitch Deck`,
                Author: 'Validately',
            },
        });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        const pageW = doc.page.width - 120;
        const irs = (0, shared_1.calcIRS)(data);
        for (let i = 0; i < SLIDES.length; i++) {
            const slide = SLIDES[i];
            const lines = slide.content(data).filter((l) => l.length > 0);
            if (lines.length === 0 && slide.title !== '')
                continue;
            if (i > 0)
                doc.addPage();
            if (i === 0) {
                doc.rect(0, 0, doc.page.width, doc.page.height).fillColor(BRAND).fill();
                doc.fontSize(40).fillColor(WHITE).text(lines[0] || projectName, 60, 150, {
                    width: pageW,
                    align: 'center',
                });
                if (lines[1] !== undefined || lines[2]) {
                    doc.moveDown(1);
                    doc.fontSize(16).fillColor(WHITE).text(lines[2] || '', { width: pageW, align: 'center' });
                }
                doc.moveDown(2);
                doc.fontSize(12).fillColor(WHITE).text(`IRS: ${irs.score}/${irs.maxScore} (${irs.band})`, { width: pageW, align: 'center' });
                continue;
            }
            doc.fontSize(24).fillColor(BRAND).text(slide.title, 60, 60, { width: pageW });
            doc.moveTo(60, doc.y + 5).lineTo(60 + pageW, doc.y + 5).strokeColor(BRAND).lineWidth(2).stroke();
            doc.moveDown(1);
            for (const line of lines) {
                const truncated = line.length > 300 ? line.slice(0, 300) + '...' : line;
                doc.fontSize(13).fillColor(TEXT).text(truncated, 60, undefined, { width: pageW });
                doc.moveDown(0.3);
            }
            doc.fontSize(8).fillColor(TEXT2).text(`${i + 1} / ${SLIDES.length}`, doc.page.width - 80, doc.page.height - 40);
        }
        doc.end();
    });
}
//# sourceMappingURL=deck-generator.js.map