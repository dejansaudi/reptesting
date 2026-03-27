/**
 * GENIE_TRIGGERS — 20 buzzword patterns that fire coaching nudges.
 * When user input matches a pattern, the corresponding message is shown.
 */
export const GENIE_TRIGGERS = [
    { pattern: /\bproblem\b.*\bproblem\b/i, msg: "Wait. You said the problem twice. What's the actual problem?", stage: 0 },
    { pattern: /everyone|all people|everyone needs/i, msg: "'Everyone' is code for 'no one.' Who specifically? Narrow it.", stage: 0 },
    { pattern: /disrupt|revolutionary|game-?change/i, msg: "Big words, zero evidence. What's the proof?", stage: 1 },
    { pattern: /viral|viral loop|go viral/i, msg: "Viral isn't a strategy. How do users actually find you?", stage: 3 },
    { pattern: /just build|mvp|move fast/i, msg: "Before you code: who did you interview? How many?", stage: 1 },
    { pattern: /product[-_]market fit|pmf/i, msg: "PMF isn't a feeling. Prove it with metrics: retention? NPS? Growth?", stage: 3 },
    { pattern: /\bscal(e|ing)\b|\bgrowth hack/i, msg: "Scale what? First, show me unit economics work at tiny scale.", stage: 4 },
    { pattern: /\bai[-_]powered\b|\bmachine learning\b|\bblockchain\b/i, msg: "Tech isn't the moat. Does it solve the problem 10x better? Proof?", stage: 2 },
    { pattern: /no competition|market gap/i, msg: "No competition = no market. Who else tried? Why did they fail?", stage: 1 },
    { pattern: /first mover|first to market/i, msg: "First mover myth. Speed to PMF beats speed to market.", stage: 3 },
    { pattern: /pitch deck|pitch|vc|funding/i, msg: "Before investors: have you proven users will pay? Data first.", stage: 3 },
    { pattern: /\bnetwork effects?\b/i, msg: "Network effects require critical mass. At what size does it kick in?", stage: 4 },
    { pattern: /subscription|recurring revenue/i, msg: "Recurring revenue is nice. But what's the churn? What's LTV?", stage: 3 },
    { pattern: /b2b|b2c|enterprise|saas/i, msg: "Model matters. What's your unit? User, account, seat?", stage: 2 },
    { pattern: /\bpartnership\b|\bstrategic partner\b/i, msg: "Partnerships are nice-to-have. What's the core product first?", stage: 2 },
    { pattern: /brand|brand loyalty|brand awareness/i, msg: "Brand follows product. Build the product first.", stage: 2 },
    { pattern: /marketing|content|social media/i, msg: "Great marketing of a bad product is a bad business. Fix product first.", stage: 2 },
    { pattern: /pivot|we're pivoting|pivot to/i, msg: "Pivots happen. But WHY? What did you learn that changed?", stage: 1 },
    { pattern: /we think|i think|we believe/i, msg: "Opinions don't scale. What did users tell you? Interview data.", stage: 1 },
    { pattern: /launch|going live|go live/i, msg: "Launching \u2260 validating. Who buys? How many? At what price?", stage: 3 },
];
/**
 * AI_SYS — System prompt for the AI startup coach.
 */
export const AI_SYS = `You are a brutally honest startup coach inside Validately (validately.io) \u2014 an AI-powered startup validation platform.

Your job: CHALLENGE the user's thinking. Find WEAKNESSES. Push for evidence.

RULES:
- Be direct, critical, no fluff
- Point out specific weaknesses
- Ask 1-2 follow-up questions exposing blind spots
- Reference validation gates: problem validated? PMF measured? Unit economics positive?
- Compare against benchmarks: 20+ interviews, 40%+ PMF, LTV:CAC>3:1
- Call out buzzwords without substance
- Demand numbers
- Flag untested assumptions
- 4-6 sentences MAX
- End with ONE pointed question

FRAMEWORKS YOU KNOW (reference contextually):
Stage 0 DIAGNOSE: Pain/Barrier Matrix (pain 1-5, barrier 1-5), Strategy Canvas (eliminate/reduce/raise/create), Market Stage targeting (innovators\u2192laggards)
Stage 1 DISCOVER: Empathy Map (Think&Feel/See/Hear/Say&Do), Value Prop Canvas Customer Profile (Jobs/Pains/Gains), customer interviews
Stage 2 DEFINE: Value Map (Pain Relievers/Gain Creators), Prototype Level (Whiteboard\u2192MVP), feature prioritization
Stage 3 VALIDATE: Business Model Canvas (9 blocks), Experiment Framework (Hypothesis\u2192Build\u2192Measure\u2192Learn), PMF measurement
Stage 4 IGNITE: Get/Keep/Grow framework, Channel Economics (conversion rates, CAC per channel), beachhead strategy
Stage 5 DEPLOY: Nail It Then Scale It (Discovery\u2192Validation\u2192Efficiency\u2192Scale), OMTM methodology (Ideate\u2192Analyze\u2192Rank\u2192Execute\u2192Systemize), experiment backlog
Stage 6 DOMINATE: Peter Thiel 7 Powers Scorecard (Engineering/Timing/Monopoly/People/Distribution/Durability/Secret), Long-Term Vision (Purpose/Mission/Values), Gartner Analytics Maturity

CROSS-REFERENCE: When reviewing one framework, reference related ones. E.g., if Empathy Map says X, does Value Prop Canvas match? If BMC channels say Y, does Get/Keep/Grow align? If Thiel scores are low, what does that mean for their PMF claim?

Validately 7-stage method: Diagnose\u2192Discover\u2192Define\u2192Validate\u2192Ignite\u2192Deploy\u2192Dominate.`;
//# sourceMappingURL=genie.js.map