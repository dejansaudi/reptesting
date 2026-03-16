/**
 * PROACTIVE_TRIGGERS — 14 triggers that auto-fire when key fields reach thresholds.
 * 1-2 per stage. Each provides a prompt template for the AI coach.
 */
export const PROACTIVE_TRIGGERS = [
    // Stage 0 — DIAGNOSE
    {
        stage: 0,
        field: 'problem_statement',
        minLength: 40,
        prompt: (val, data) => `The user just described their problem: "${val.substring(0, 200)}". Give a real-world example of a startup that tackled a similar problem (include company name, what happened, outcome with numbers). Then point out ONE specific weakness in their problem statement and ask ONE sharp follow-up question. Be brutally specific.`,
    },
    {
        stage: 0,
        field: 'tam_sam_som',
        minLength: 20,
        prompt: (val, data) => `The user estimated their market as: "${val.substring(0, 200)}". Compare this to a real startup's TAM/SAM/SOM (give specific numbers). Point out if their estimate seems inflated or too vague. Ask ONE question about how they calculated these numbers.`,
    },
    // Stage 1 — DISCOVER
    {
        stage: 1,
        field: 'interviews_count',
        minLength: 1,
        prompt: (val, data) => `User says they did ${val} interviews. Real example: Superhuman did 100+ interviews before writing a line of code. Dropbox validated with a video, not a product. If their count is low (<15), challenge them hard. If decent, suggest what to look for in the next batch. Ask ONE question about interview quality vs quantity.`,
    },
    {
        stage: 1,
        field: 'verbatim_quotes',
        minLength: 30,
        prompt: (val, data) => `The user shared these customer quotes: "${val.substring(0, 300)}". Analyze the quality. Are these real pain signals or polite feedback? Reference: Amazon's "working backwards" method \u2014 real customer pain sounds desperate, not polite. Point out which quotes sound strongest and which sound like vanity. Ask ONE follow-up.`,
    },
    // Stage 2 — DEFINE
    {
        stage: 2,
        field: 'value_prop',
        minLength: 30,
        prompt: (val, data) => `Value proposition: "${val.substring(0, 200)}". Compare to great value props: Stripe ("payments for developers"), Slack ("where work happens"), Figma ("design together"). Is theirs specific enough? Does it pass the "so what?" test? Challenge ONE weakness. Real example of a startup that nailed vs failed their value prop.`,
    },
    {
        stage: 2,
        field: 'must_have',
        minLength: 20,
        prompt: (val, data) => `Must-have features: "${val.substring(0, 200)}". Reference: Instagram launched with ONLY photo filters + social sharing. Twitter was just 140 chars. If they listed more than 3 features, push back HARD. Real example of feature creep killing a startup. Ask: which ONE feature would users pay for alone?`,
    },
    // Stage 3 — VALIDATE
    {
        stage: 3,
        field: 'pmf_score',
        minLength: 1,
        prompt: (val, data) => `PMF score: ${val}%. Sean Ellis benchmark: 40%+ means PMF. Superhuman measured 58% and celebrated. If below 40%, this is a RED FLAG \u2014 reference Quibi (launched without PMF, lost $1.75B). If above 40%, validate HOW they measured it. Ask ONE question about methodology.`,
    },
    {
        stage: 3,
        field: 'ltv_cac_ratio',
        minLength: 1,
        prompt: (val, data) => `LTV:CAC ratio: ${val}. Benchmark: 3:1 is healthy (SaaS standard). Netflix early days: ~7:1. If below 3:1, this is unsustainable \u2014 reference Homejoy (CAC>LTV, collapsed). If good, ask about payback period. Give ONE specific suggestion to improve the ratio.`,
    },
    // Stage 4 — IGNITE
    {
        stage: 4,
        field: 'beachhead_segment',
        minLength: 20,
        prompt: (val, data) => `Beachhead: "${val.substring(0, 200)}". Reference: Facebook started with Harvard only. Uber started with SF tech workers. PayPal started with eBay power sellers. Is their beachhead narrow enough? Challenge if it's too broad. Ask ONE question about why THIS segment first.`,
    },
    {
        stage: 4,
        field: 'first_10_customers',
        minLength: 20,
        prompt: (val, data) => `First 10 customers plan: "${val.substring(0, 200)}". Reference: Airbnb went door-to-door in NYC. Stripe installed for early users manually. DoorDash delivered food themselves. Are they willing to do unscalable things? Challenge any plan that relies on ads or "going viral." Ask ONE specific tactical question.`,
    },
    // Stage 5 — DEPLOY
    {
        stage: 5,
        field: 'sales_playbook',
        minLength: 30,
        prompt: (val, data) => `Sales playbook: "${val.substring(0, 200)}". Reference: HubSpot's inbound flywheel, Salesforce's "no software" direct sales. Does their playbook have clear steps? Is it repeatable by someone OTHER than the founder? Challenge vagueness. Ask ONE question about conversion rates between steps.`,
    },
    {
        stage: 5,
        field: 'gross_margin',
        minLength: 1,
        prompt: (val, data) => `Gross margin: ${val}%. Benchmarks: SaaS 70-80%, Marketplace 50-70%, Hardware 30-50%. WeWork had <30% margins disguised as tech. If below 50%, challenge scalability. Give ONE real-world comparison and ask what they can do to improve margin.`,
    },
    // Stage 6 — DOMINATE
    {
        stage: 6,
        field: 'thiel_moat',
        minLength: 40,
        prompt: (val, data) => `Moat description: "${val.substring(0, 200)}". Peter Thiel's 7 Powers: network effects (Facebook), economies of scale (Amazon), switching costs (Salesforce), brand (Apple), proprietary tech (Google Search), data (Waze), cornered resources (De Beers). Which power do they ACTUALLY have? Challenge any claims without evidence. Ask ONE pointed question.`,
    },
    {
        stage: 6,
        field: 'arr_mrr',
        minLength: 1,
        prompt: (val, data) => `Revenue: ${val}. Benchmarks: $1M ARR = real business. $10M ARR = Series B territory. $100M ARR = category leader. Reference their number against stage-appropriate benchmarks. If impressive, challenge sustainability. If low, suggest ONE specific growth lever. Ask about growth rate (MoM%).`,
    },
];
//# sourceMappingURL=proactive.js.map