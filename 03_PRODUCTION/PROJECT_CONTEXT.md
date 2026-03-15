# VALIDATELY.IO — PROJECT CONTEXT FOR CLAUDE CODE

## READ THIS FIRST

You are building the production version of Validately.io — an AI-powered startup validation platform. This document gives you full context. Read it entirely before writing any code.

---

## WHAT VALIDATELY IS

A 7-stage guided validation journey that takes founders from raw idea to investor-ready startup. Each stage embeds real frameworks (Business Model Canvas, Empathy Map, Thiel's 7 Powers, etc.) with structured inputs, quality scoring, AI coaching, and gate criteria that prevent premature advancement.

**Why it matters:** No competitor covers the full lifecycle. Strategyzer does BMC only. GLIDR does canvases + evidence. DimeADozen generates quick AI reports. Validately is the only tool that guides a founder through 101 structured fields across 7 stages with proactive AI coaching, quality scoring per field, and investor readiness scoring. Benchmark score: 94/100 vs next-best 40/100. See `03_PRODUCTION/Validately_Benchmark_Report.xlsx` for full competitive analysis.

---

## FOLDER STRUCTURE

```
Dejan - ME Startup School/
├── 01_INPUTS/                          # SOURCE MATERIAL (read-only reference)
│   ├── methodology/                    # 70+ PDFs from MIT Design X + Hekovnik Startup School
│   │   ├── 0 STRATEGY MAP/            # Strategy Canvas, timing frameworks
│   │   ├── 1 TIMING AND POSITIONING/  # Market stage, pain/barrier pyramid, competitive position
│   │   ├── 2 CUSTOMER-PROBLEM-FIT/    # Customer profiling, segmentation
│   │   ├── 3 PROBLEM-SOLUTION-FIT/    # Empathy map, hook model, value proposition
│   │   ├── 4 VALIDATION/              # BMC, PMF template, financial cohort, channels
│   │   ├── 5 PRODUCT-MARKET-FIT/      # Growth optimization, competition
│   │   ├── 6 MARKET/                  # Thiel's 7 Powers, NailItThenScaleIt, culture
│   │   ├── 7 FROM PROJECT TO PROCESS/ # OMTM, experiment planning, weekly review
│   │   ├── 8 ANALYTICS/               # Gartner maturity, hypothesis stages, long-term view
│   │   └── Design Process Overall/    # MIT DesignSX complete framework mapping
│   ├── design_assets/                  # Adobe Illustrator source files for all templates
│   └── reference/                      # Additional reference material
│
├── 02_POC/                             # PROOF OF CONCEPT (working prototype)
│   ├── Validately.html                 # ★ THE POC — 2,068-line single-file React app
│   ├── Validately_backup.html          # Backup before major changes
│   ├── VenturePath.html                # Previous version (before rebrand)
│   └── VenturePath.jsx                 # Original JSX version
│
├── 03_PRODUCTION/                      # PRODUCTION PLANNING & SPECS
│   ├── PROJECT_CONTEXT.md              # THIS FILE — read first
│   ├── CLAUDE_CODE_INSTRUCTIONS.md     # ★ Sprint-by-sprint build instructions
│   ├── Validately_Production_Roadmap.md # Architecture roadmap
│   ├── Validately_Critical_Assessment.docx # Honest assessment of gaps
│   └── Validately_Benchmark_Report.xlsx # 8-sheet competitive analysis
```

---

## THE POC — WHAT EXISTS AND WORKS

The file `02_POC/Validately.html` is a fully functional single-file React 18.2 app. It is NOT throwaway — the business logic, frameworks, scoring algorithms, AI prompts, and gate criteria have been carefully designed and iterated. The production build should extract and preserve this logic, not rewrite it.

### Tech Stack (POC)
- React 18.2 via CDN, `React.createElement()` only (no JSX, no build step)
- Discord Onyx dark theme (#111214 background, #5865f2 brand)
- localStorage persistence (7 keys)
- Direct browser-to-Anthropic API calls (claude-sonnet-4-5-20250929)
- Mobile-first responsive (768px breakpoint)

### Components (19 total)
| Component | Purpose |
|-----------|---------|
| `App` | Main orchestrator — state, routing, layout |
| `SF` (SmartField) | Universal text/textarea input with quality badge + AI button |
| `SEL` (SelectField) | Dropdown with gate marking |
| `Benchmark` | Visual threshold indicator (good/ok/bad) |
| `QBadge` | Color-coded quality score (1-5) |
| `Ring` | SVG circular progress indicator |
| `Confetti` | Canvas animation on stage completion |
| `Section` | Collapsible section container |
| `FailStory` | Per-stage startup failure case study |
| `Tip` | Informational tooltip |
| `InvestorReadiness` | IRS score display with progress bar |
| `MarketplaceTouchpoint` | Suggests expert needed per stage |
| `GeniePanel` | AI coach chat (mobile drawer + desktop panel) |
| `ResearchPanel` | AI market research modal |
| `SharePanel` | Export/import/share functionality |
| `SnapshotPanel` | Version history (max 20 snapshots) |
| `PricingModal` | Subscription tier display |
| `SettingsModal` | API key configuration |
| `Assess` | Stage assessment before advancement |

### Data Architecture
All user data stored in a single flat JSON object with 101 keys. This is intentional — it's always read/written as one unit. In production, store as JSONB in Postgres.

**101 fields across 7 stages:**

Stage 0 DIAGNOSE (14 fields): `startup_name`, `team_size`, `problem_statement`, `who_has_problem`, `contrarian_bet`, `why_now`, `tam_sam_som`, `unfair_advantage`, `assumptions`, `pain_level`, `barrier_level`, `target_adopter`, `strategy_eliminate`, `strategy_create`

Stage 1 DISCOVER (14 fields): `interviews_count`, `verbatim_quotes`, `persona_primary`, `top_pains`, `think_feel`, `current_workarounds`, `journey_map`, `competitor_matrix`, `empathy_think_feel`, `empathy_see`, `empathy_hear`, `empathy_say_do`, `customer_jobs`, `customer_gains`

Stage 2 DEFINE (12 fields): `core_problem`, `value_prop`, `must_have`, `not_building`, `hook_trigger`, `hook_action`, `hook_reward`, `hook_investment`, `pain_relievers`, `gain_creators`, `prototype_level`, `prototype_test_plan`

Stage 3 VALIDATE (19 fields): `pmf_score`, `retention_d7`, `activation_rate`, `cac`, `ltv`, `ltv_cac_ratio`, `payback`, `revenue_model`, `pmf_verdict`, `key_learning`, `bmc_channels`, `bmc_customer_relationships`, `bmc_key_resources`, `bmc_key_activities`, `bmc_key_partners`, `bmc_cost_structure`, `experiment_hypothesis`, `experiment_result`, `experiment_learning`

Stage 4 IGNITE (12 fields): `beachhead_segment`, `omtm`, `primary_channel`, `pricing_model`, `first_10_customers`, `retention_strategy`, `expansion_playbook`, `get_strategy`, `keep_strategy`, `grow_strategy`, `channel_conversion`, `channel_cac`

Stage 5 DEPLOY (13 fields): `current_phase`, `sales_playbook`, `sales_cycle`, `omtm_metric`, `omtm_target`, `omtm_process`, `experiment_backlog`, `weekly_review`, `hypothesis_log`, `okrs`, `team_plan`, `expansion_revenue`, `gross_margin`

Stage 6 DOMINATE (17 fields): `thiel_engineering`, `thiel_timing`, `thiel_monopoly`, `thiel_people`, `thiel_distribution`, `thiel_durability`, `thiel_secret`, `thiel_moat`, `market_share`, `arr_mrr`, `analytics_maturity`, `data_driven_decision`, `exit_strategy`, `company_purpose`, `company_mission`, `company_values`, `vision_10yr`

### Scoring Algorithms (MUST preserve exactly)
- **`qScore(value)`** — Quality score per text field. Penalizes buzzwords ("everyone", "disrupt", "synergy"), rewards specificity (numbers, evidence, action words). Returns {t: 0-100, s: specificity, e: evidence, a: action}.
- **`calcIRS(data)`** — Investor Readiness Score. Weighted composite across all 7 stages. Max 890 points. Bands: Pre-Seed (<100), MVP (100-199), Seed (200-299), Series A (300-399), Growth (400-499), Late-Stage (500+).
- **`runXV(data)`** — Cross-validation. 16 checks (VCHECKS) that flag inconsistencies across stages. Returns issues array with stage, severity, and message.

### Gate Criteria (MUST preserve exactly)
Each stage has 4-7 must-pass gates. Users cannot advance until gates are met. Gate types: `required`, `minLength:N`, `minValue:N`, `maxValue:N`. Full gate definitions are in the POC source (GATE_CRITERIA array).

### AI System
- **AI_SYS**: 1,400-word system prompt. "Brutally honest startup coach." References all 7 stages and 10+ frameworks. 4-6 sentence max responses with one pointed question.
- **PROACTIVE_TRIGGERS**: 12 auto-fire rules. When a field hits a threshold (e.g., problem_statement > 40 chars), AI automatically reviews it. No user action needed.
- **GENIE_TRIGGERS**: 20 regex patterns detecting startup buzzwords. Instant tooltip challenges: "'Everyone' is code for 'no one.' Who specifically?"

### Pricing Tiers (defined in POC)
- FREE ($0): All 7 stages, 45+ fields, AI coach (BYOK), scoring, gamification
- PRO ($19/mo): + Hosted AI, PDF export, pitch deck, public page, snapshots (50), 5 projects, AI research
- TEAM ($49/mo): + Collaboration (5 members), unlimited projects/snapshots, white-label, priority support

### Export Features (all client-side in POC)
- `generatePDF(data, stageIdx)` — Investor-ready validation report (printable HTML)
- `generatePitchDeck(data, stageIdx)` — 11-slide dark-themed pitch deck (100vh slides, print-ready)
- `generatePublicPage(data, stageIdx)` — Read-only white-background shareable page
- JSON export/import via SharePanel
- Base64-encoded URL share links
- Auto-snapshots on stage advancement

---

## CRITICAL DESIGN DECISIONS (ALREADY MADE)

1. **Scale-ready from day 1.** Proper separation of concerns, proper backend, proper infrastructure. Slightly over-engineered is fine. We do NOT want a "rewrite everything at month 3" scenario.

2. **Hybrid AI model.** Free users bring their own API key (direct browser calls). Pro/Team users get hosted AI through the backend (you pay, they don't need a key).

3. **Revenue-first priority.** Stripe + Pro tier gating is the critical path. But the architecture should support team collaboration and scale from the beginning.

4. **Public pages are free (with branding).** This is the growth loop. Every shared page = marketing. Remove branding for Pro.

5. **Business logic runs on both client and server.** Scoring, gate validation, and triggers must be in shared packages. The server is the authority, but the client needs them for instant feedback.

---

## WHAT THE CRITICAL ASSESSMENT IDENTIFIED (read `Validately_Critical_Assessment.docx`)

Key gaps to address in production:
- **Security**: API keys must be encrypted at rest, never exposed client-side in production
- **Input sanitization**: All 101 fields need DOMPurify before HTML rendering (XSS risk)
- **AI prompt injection**: User data concatenated into AI prompts needs sanitization
- **Error boundaries**: React ErrorBoundary around every major section
- **Loading/save states**: Visual indicators for auto-save, AI requests
- **Onboarding**: AI-powered "type one sentence, pre-fill 8 fields" wizard
- **Product analytics**: PostHog for stage completion rates, field skip rates, time-to-IRS
- **Testing from day 1**: Vitest for shared logic, Playwright for E2E, integration tests for Stripe
- **Observability from day 1**: Sentry + structured logging (Pino)
- **Data migration**: localStorage → cloud import bridge for existing POC users
