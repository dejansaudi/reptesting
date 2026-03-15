# CLAUDE CODE — BUILD INSTRUCTIONS FOR VALIDATELY.IO

## HOW TO USE THIS DOCUMENT

This is a sprint-by-sprint specification. Execute one sprint at a time. Each sprint has:
- **GOAL** — what we're building and why
- **PREREQUISITES** — what must exist before starting
- **TASKS** — numbered steps in exact execution order
- **FILES TO CREATE** — exact file paths and what goes in them
- **VERIFICATION** — how to prove it works before moving on

Before starting, read `PROJECT_CONTEXT.md` in this folder for full background on the product, data architecture, and design decisions.

The working POC is at `02_POC/Validately.html` — extract business logic from there, don't rewrite it.

---

## TECHNOLOGY STACK (FINAL)

```
Frontend:       Next.js 15 (App Router, TypeScript, Tailwind CSS)
Backend API:    NestJS (TypeScript, modular, decorator-based DI)
Database:       PostgreSQL 16 (via Prisma ORM)
Cache:          Redis (Upstash serverless for dev, managed for prod)
Queue:          BullMQ (backed by Redis)
Object Storage: Cloudflare R2 (S3-compatible, zero egress fees)
Payments:       Stripe (Checkout, Customer Portal, Webhooks)
Auth:           NextAuth.js v5 (Auth.js) — Google OAuth + email magic links
Email:          Resend (transactional)
Hosting:        Vercel (frontend) + Railway (API + workers + Redis + Postgres)
Monitoring:     Sentry (errors) + Pino (structured logs) + PostHog (product analytics)
Testing:        Vitest (unit) + Playwright (E2E) + Supertest (API integration)
Monorepo:       Turborepo with pnpm workspaces
```

---

## SPRINT 0: MONOREPO SCAFFOLDING + INFRASTRUCTURE (Day 1-3)

### GOAL
Set up the entire project skeleton so every subsequent sprint just adds code to existing structure. Infrastructure, CI, linting, testing frameworks — all wired before writing business logic.

### TASKS

**0.1 Create Turborepo monorepo**
```bash
pnpm dlx create-turbo@latest validately --package-manager pnpm
cd validately
```

**0.2 Create Next.js frontend**
```bash
cd apps
pnpm dlx create-next-app@latest web --typescript --tailwind --app --src-dir --use-pnpm
```

**0.3 Create NestJS backend**
```bash
pnpm dlx @nestjs/cli new api --package-manager pnpm --strict
```

**0.4 Create shared packages**
```
packages/
├── shared/          # Business logic, types, constants
│   ├── src/
│   │   ├── constants/
│   │   │   ├── colors.ts        # C color palette from POC
│   │   │   ├── stages.ts        # STAGE_META array
│   │   │   └── pricing.ts       # PRICING_TIERS
│   │   ├── scoring/
│   │   │   ├── qScore.ts        # Quality scoring — extract from POC line 71-81
│   │   │   ├── calcIRS.ts       # Investor Readiness — extract from POC line 837-867
│   │   │   └── runXV.ts         # Cross-validation — extract from POC VCHECKS
│   │   ├── gates/
│   │   │   ├── criteria.ts      # GATE_CRITERIA — extract from POC line 188-313
│   │   │   └── validate.ts      # Gate validation logic
│   │   ├── triggers/
│   │   │   ├── proactive.ts     # PROACTIVE_TRIGGERS — extract from POC line 163-185
│   │   │   └── genie.ts         # GENIE_TRIGGERS buzzword patterns
│   │   ├── types/
│   │   │   ├── project.ts       # ProjectData interface (all 101 fields typed)
│   │   │   ├── stage.ts         # Stage, StageMeta, GateCriteria types
│   │   │   ├── user.ts          # User, Plan, TeamRole types
│   │   │   └── ai.ts            # AIMessage, ResearchResult types
│   │   └── index.ts             # Barrel exports
│   ├── package.json
│   └── tsconfig.json
│
├── db/              # Prisma client
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   └── index.ts  # Export PrismaClient
│   ├── package.json
│   └── tsconfig.json
│
└── eslint-config/   # Shared ESLint config
```

**0.5 Configure Turborepo**
`turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] },
    "test:e2e": { "dependsOn": ["build"] },
    "db:push": { "cache": false },
    "db:generate": { "cache": false }
  }
}
```

**0.6 Set up tooling**
- ESLint + Prettier (shared config in `packages/eslint-config`)
- TypeScript strict mode in all packages
- `.env.example` with all required variables:
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/validately

# Auth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email
RESEND_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# AI
ANTHROPIC_API_KEY=

# Redis
REDIS_URL=redis://localhost:6379

# Storage
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=validately-exports

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

**0.7 Set up Sentry + Pino from day 1**
- `@sentry/nextjs` in `apps/web`
- `@sentry/node` in `apps/api`
- `pino` + `pino-pretty` for structured logging in API
- Configure Sentry source maps for both apps

**0.8 Set up testing frameworks**
- `vitest` in `packages/shared` (unit tests for scoring, gates, triggers)
- `@nestjs/testing` + `supertest` in `apps/api` (integration tests)
- `@playwright/test` in `apps/web` (E2E tests)
- Add `test` and `test:e2e` scripts to `turbo.json`

### VERIFICATION
```bash
pnpm dev                    # Both apps start (web:3000, api:4000)
pnpm build                  # Both apps build without errors
pnpm lint                   # Zero lint errors
pnpm test                   # Test runner works (0 tests pass is fine)
curl http://localhost:4000/health  # Returns { status: "ok" }
```

---

## SPRINT 1: DATABASE + AUTH + SHARED LOGIC (Day 4-8)

### GOAL
Database schema, authentication, and all shared business logic extracted from POC with tests.

### PREREQUISITES
Sprint 0 complete. `pnpm dev` runs both apps.

### TASKS

**1.1 Prisma schema**
Create `packages/db/prisma/schema.prisma` — see `PROJECT_CONTEXT.md` or use the schema from `Validately_Production_Roadmap.md`. It includes: User, Project, Snapshot, TeamMember models with Plan and TeamRole enums.

Add additional fields to Project model:
```prisma
model Project {
  // ... existing fields ...
  version       Int       @default(0)    // Optimistic locking for collaboration
  irsScore      Int       @default(0)    // Cached IRS for quick queries
  irsband       String    @default("Pre-Seed")
}
```

Add to User model:
```prisma
model User {
  // ... existing fields ...
  onboardingDone  Boolean  @default(false)
  aiRequestsToday Int      @default(0)
  aiRequestsReset DateTime @default(now())
}
```

Run:
```bash
pnpm --filter db db:push    # Create tables
pnpm --filter db db:generate # Generate Prisma client
```

**1.2 Extract ALL shared logic from POC**
Read `02_POC/Validately.html` and extract these functions into `packages/shared/src/`:

- `scoring/qScore.ts` — POC lines 71-81. Convert to TypeScript. Add JSDoc. Write 10+ unit tests covering: empty string, buzzwords penalty, specificity bonus, evidence detection, action words.
- `scoring/calcIRS.ts` — POC lines 837-867. Convert to TypeScript. Write tests for each IRS band boundary.
- `scoring/runXV.ts` — POC VCHECKS array + runXV function. Convert to TypeScript. Test each of the 16 validation checks.
- `gates/criteria.ts` — POC lines 188-313. Convert to TypeScript. Type each gate check.
- `gates/validate.ts` — Gate validation logic (check required, minLength, minValue). Write tests for each gate type.
- `triggers/proactive.ts` — POC lines 163-185. All 12 auto-fire rules.
- `triggers/genie.ts` — POC GENIE_TRIGGERS. All 20 buzzword regex patterns.
- `constants/colors.ts` — POC lines 40-50. The full C object.
- `constants/stages.ts` — POC lines 59-68. STAGE_META with all 7 stages.
- `constants/pricing.ts` — POC lines 53-57. PRICING_TIERS.
- `types/project.ts` — TypeScript interface for ALL 101 data fields. Every field typed (string, number, or string enum). Include JSDoc comments explaining each field.

**CRITICAL: Run `pnpm --filter shared test` after each extraction. Every scoring function must have passing tests before moving on.**

**1.3 NextAuth.js v5 setup**
In `apps/web`:
```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts
│   └── (auth)/
│       ├── login/page.tsx
│       └── signup/page.tsx
├── auth.ts              # NextAuth config
├── auth.config.ts       # Edge-compatible config
└── middleware.ts         # Route protection
```

Providers:
- Google OAuth (for speed — most founders use Google)
- Email magic link via Resend (for those who don't)

Prisma adapter: `@auth/prisma-adapter`

Middleware must protect:
- `/workspace/*` — requires auth
- `/settings/*` — requires auth
- `/api/*` (except `/api/auth/*` and `/api/public/*`) — requires auth

Public routes:
- `/` — landing page
- `/pricing` — pricing page
- `/p/[slug]` — public project page
- `/api/auth/*` — auth endpoints
- `/api/public/*` — public API (project viewer)
- `/api/billing/webhook` — Stripe webhook (uses Stripe signature verification, not session auth)

**1.4 NestJS auth module**
In `apps/api/src/auth/`:
- JWT verification middleware (validates NextAuth JWT tokens)
- `@CurrentUser()` decorator to inject user into controllers
- Guards: `AuthGuard`, `PlanGuard('PRO')`, `PlanGuard('TEAM')`
- Rate limiting module (using `@nestjs/throttler` + Redis store)

**1.5 Seed script**
`packages/db/prisma/seed.ts` — creates a test user with a sample project containing realistic data for all 101 fields.

### VERIFICATION
```bash
pnpm --filter shared test          # All scoring/gate/trigger tests pass
pnpm --filter db db:push           # Schema applies cleanly
pnpm dev                           # Both apps start
# Manual: Sign in with Google → user created in DB
# Manual: Sign in with email → magic link received → user created
# Manual: Visit /workspace without auth → redirected to /login
# Manual: Visit /p/test-slug without auth → page loads (public)
```

---

## SPRINT 2: PROJECT CRUD + AUTO-SAVE + PRODUCT ANALYTICS (Day 9-14)

### GOAL
Users can create projects, edit fields, and data persists to Postgres with auto-save. Product analytics track every meaningful action.

### PREREQUISITES
Sprint 1 complete. Auth works. Shared logic extracted and tested.

### TASKS

**2.1 NestJS Projects module**
`apps/api/src/projects/`:
```
projects.module.ts
projects.controller.ts
projects.service.ts
projects.dto.ts          # CreateProjectDto, UpdateProjectDto (validated with class-validator)
```

Endpoints:
```
POST   /projects              # Create project (enforce plan limits: FREE=1, PRO=5, TEAM=unlimited)
GET    /projects              # List user's projects (paginated, sorted by updatedAt)
GET    /projects/:id          # Get single project (auth check: owner or team member)
PATCH  /projects/:id          # Update project data (partial JSONB merge, increment version)
DELETE /projects/:id          # Soft delete (set deletedAt, don't actually remove)
POST   /projects/:id/advance  # Advance stage — SERVER validates gate criteria before allowing
GET    /projects/:id/public   # Public view (only if isPublic=true, no auth required)
```

**CRITICAL on PATCH:** The update endpoint receives a partial data object (just the fields that changed). It does a JSONB merge:
```sql
UPDATE projects SET data = data || $1, version = version + 1, "updatedAt" = NOW() WHERE id = $2 AND version = $3
```
If version doesn't match (optimistic lock), return 409 Conflict.

**2.2 Frontend: Zustand store + React Query**
`apps/web/src/stores/project.ts`:
```typescript
// Zustand store for local state (instant UI updates)
interface ProjectStore {
  project: Project | null;
  isDirty: boolean;
  lastSaved: Date | null;
  saveStatus: 'saved' | 'saving' | 'error' | 'offline';
  updateField: (key: string, value: string | number) => void;
}
```

`apps/web/src/hooks/useAutoSave.ts`:
```typescript
// Debounce field changes by 1500ms, then PATCH to server
// On success: set saveStatus='saved'
// On 409: refetch from server, show "Someone else edited" toast
// On network error: queue in localStorage, set saveStatus='offline', retry every 30s
```

**2.3 Frontend: Workspace page**
`apps/web/src/app/(dashboard)/workspace/page.tsx`:
- Project list view (if multiple projects)
- Project editor view (7-stage tabs)
- Extract stage render components from POC into `apps/web/src/components/stages/Stage0.tsx` through `Stage6.tsx`
- Convert from `React.createElement()` to JSX
- Use Tailwind CSS instead of inline styles (match Discord Onyx theme via Tailwind config)

**2.4 Component library migration**
Convert POC components to proper TypeScript React components:
```
apps/web/src/components/
├── ui/
│   ├── SmartField.tsx       # SF from POC — text/textarea with quality badge
│   ├── SelectField.tsx      # SEL from POC — dropdown with gate marking
│   ├── BenchmarkBar.tsx     # Benchmark from POC — good/ok/bad thresholds
│   ├── QualityBadge.tsx     # QBadge from POC — color-coded score
│   ├── ProgressRing.tsx     # Ring from POC — SVG circular progress
│   ├── SaveIndicator.tsx    # NEW — shows save status (saved/saving/error/offline)
│   └── GateChecklist.tsx    # Gate requirements per stage
├── stages/
│   ├── Stage0Diagnose.tsx
│   ├── Stage1Discover.tsx
│   ├── Stage2Define.tsx
│   ├── Stage3Validate.tsx
│   ├── Stage4Ignite.tsx
│   ├── Stage5Deploy.tsx
│   └── Stage6Dominate.tsx
└── layout/
    ├── DashboardShell.tsx   # Sidebar + main content + AI panel
    ├── StageNav.tsx         # Stage navigation (sidebar on desktop, bottom on mobile)
    └── TopBar.tsx           # Header with save status, settings, pricing
```

**2.5 PostHog product analytics**
Track these events from day 1:
```typescript
posthog.capture('project_created');
posthog.capture('field_edited', { stage: 0, field: 'problem_statement' });
posthog.capture('stage_advanced', { from: 0, to: 1, irs_score: 120 });
posthog.capture('gate_check_failed', { stage: 0, gate: 'problem_statement', reason: 'too_short' });
posthog.capture('ai_coach_triggered', { trigger_type: 'proactive', stage: 0 });
posthog.capture('export_clicked', { type: 'pdf' | 'pitch_deck' | 'public_page' });
posthog.capture('upgrade_prompt_shown', { feature: 'pdf_export', current_plan: 'FREE' });
```

**2.6 Data migration bridge**
`apps/web/src/app/(dashboard)/workspace/import/page.tsx`:
On first login, check if `localStorage.validately_data` exists. If yes, show modal: "We found existing validation data in your browser. Import it to your cloud account?" with Preview and Import buttons.

### VERIFICATION
```bash
pnpm --filter api test           # CRUD integration tests pass
pnpm --filter web build          # Frontend builds
pnpm dev                         # Full stack runs
# Manual: Create project → edit problem_statement → wait 2s → refresh → data persists
# Manual: Open in incognito with same account → same data loads
# Manual: Edit same project in two tabs → second tab gets 409 → shows conflict warning
# Manual: Turn off wifi → edit field → turn on wifi → data syncs
# Manual: Check PostHog dashboard → events appearing
```

---

## SPRINT 3: STRIPE + PRO TIER GATING (Day 15-20)

### GOAL
Users can upgrade to Pro via Stripe Checkout. Pro features are gated. Revenue starts flowing.

### PREREQUISITES
Sprint 2 complete. Projects work with auto-save.

### TASKS

**3.1 Stripe configuration**
In Stripe Dashboard (test mode first):
- Create Product: "Validately Pro" → Price: $19/month (recurring)
- Create Product: "Validately Team" → Price: $49/month (recurring)
- Create Customer Portal configuration (allow cancel, plan change)
- Set up webhook endpoint: `https://api.validately.io/billing/webhook`
- Events to send: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `checkout.session.completed`

**3.2 NestJS Billing module**
`apps/api/src/billing/`:
```
billing.module.ts
billing.controller.ts
billing.service.ts
stripe.service.ts        # Stripe SDK wrapper
```

Endpoints:
```
POST  /billing/checkout      # Create Stripe Checkout Session (requires auth)
POST  /billing/portal        # Create Stripe Customer Portal Session (requires auth)
POST  /billing/webhook       # Stripe webhook handler (uses stripe signature, NOT session auth)
GET   /billing/status        # Get subscription status (requires auth)
```

**Checkout flow:**
1. User clicks "Upgrade to Pro" → frontend calls `POST /billing/checkout` with `priceId`
2. Backend creates Stripe Checkout Session with user's email, returns session URL
3. Frontend redirects to Stripe Checkout
4. User pays → Stripe fires `checkout.session.completed` webhook
5. Webhook handler: look up Stripe customer → find user by `stripeId` → update `user.plan = PRO`
6. User redirected back to `/workspace?upgraded=true` → confetti animation

**3.3 Feature gating**

Backend (`apps/api/src/common/guards/plan.guard.ts`):
```typescript
@Injectable()
export class PlanGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredPlan = this.reflector.get<Plan>('plan', context.getHandler());
    const user = context.switchToHttp().getRequest().user;
    if (requiredPlan === 'PRO') return user.plan !== 'FREE';
    if (requiredPlan === 'TEAM') return user.plan === 'TEAM';
    return true;
  }
}

// Usage on controllers:
@SetMetadata('plan', 'PRO')
@UseGuards(PlanGuard)
@Post('export/pdf')
async generatePDF() { ... }
```

Frontend (`apps/web/src/hooks/useFeatureGate.ts`):
```typescript
export function useFeatureGate() {
  const { data: user } = useUser();
  const plan = user?.plan ?? 'FREE';

  return {
    canExportPDF: plan !== 'FREE',
    canUsePitchDeck: plan !== 'FREE',
    canUseHostedAI: plan !== 'FREE',
    canUsePublicPage: true,          // FREE with branding (growth loop)
    canRemoveBranding: plan !== 'FREE',
    canCreateProject: plan === 'TEAM' || projectCount < (plan === 'PRO' ? 5 : 1),
    canInviteTeam: plan === 'TEAM',
    canUseResearch: plan !== 'FREE',
    maxSnapshots: plan === 'FREE' ? 5 : plan === 'PRO' ? 50 : Infinity,
    plan,
  };
}
```

When a FREE user clicks a gated feature:
```typescript
// Don't just disable the button — show what they're missing
<UpgradePrompt
  feature="PDF Export"
  description="Generate investor-ready validation reports"
  plan="PRO"
  onUpgrade={() => router.push('/pricing')}
/>
```

**3.4 Pricing page**
`apps/web/src/app/pricing/page.tsx`:
Public pricing page with 3 tiers. Use the PRICING_TIERS from `packages/shared`. Pro highlighted as "Most Popular." Each tier's CTA button:
- Free: "Get Started Free" → `/signup`
- Pro: "Start Pro — $19/mo" → `/api/billing/checkout?price=pro`
- Team: "Start Team — $49/mo" → `/api/billing/checkout?price=team`

**3.5 Stripe webhook integration tests**
Write tests that:
- Simulate `checkout.session.completed` → verify user.plan updated
- Simulate `customer.subscription.deleted` → verify user.plan reverted to FREE
- Simulate `invoice.payment_failed` → verify user flagged
- Verify webhook rejects requests with invalid Stripe signature

### VERIFICATION
```bash
pnpm --filter api test           # Stripe webhook tests pass
# Manual: Stripe test mode — use card 4242424242424242
# Manual: Click upgrade → complete Stripe Checkout → plan changes to PRO → PDF export unlocks
# Manual: Go to Stripe Portal → cancel subscription → plan reverts to FREE → PDF locked again
# Manual: FREE user clicks "Export PDF" → sees upgrade prompt, not error
```

---

## SPRINT 4: AI PROXY + HOSTED AI (Day 21-26)

### GOAL
Pro/Team users get AI coaching without their own API key. Rate-limited, cost-controlled.

### PREREQUISITES
Sprint 3 complete. Stripe works. Plan gating works.

### TASKS

**4.1 NestJS AI module**
`apps/api/src/ai/`:
```
ai.module.ts
ai.controller.ts
ai.service.ts
ai.prompts.ts            # AI_SYS and all prompt templates — extract from POC
rate-limiter.service.ts   # Redis-backed per-user rate limiting
```

Endpoints:
```
POST  /ai/chat       # AI Coach message (sync, <10s)
POST  /ai/research   # Market research (async via queue, 15-30s)
POST  /ai/review     # Proactive field review (sync, <10s)
GET   /ai/jobs/:id   # Check async job status
GET   /ai/usage      # Get user's daily AI request count
```

**4.2 Dual-mode AI architecture**

```typescript
// In the frontend — choose route based on plan
async function sendAIMessage(message: string) {
  if (user.plan === 'FREE' && user.apiKey) {
    // Direct browser → Anthropic (existing BYOK flow)
    return await askAIDirect(user.apiKey, AI_SYS, message);
  } else if (user.plan !== 'FREE') {
    // Through backend proxy
    return await fetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, projectId, stageIdx })
    });
  } else {
    // FREE user without API key — show settings modal
    showSettingsModal();
  }
}
```

**4.3 Rate limiting (Redis)**
```typescript
// Per-user daily limits
const LIMITS = {
  FREE: 0,      // Must BYOK
  PRO: 100,     // 100 requests/day
  TEAM: 500,    // 500 requests/day
};

// Check: INCR user:{id}:ai:daily, EXPIRE 86400
// If over limit: return 429 with { remaining: 0, resetAt: timestamp }
```

**4.4 BullMQ for research jobs**
Research takes 15-30s (too long for sync request).
```typescript
// POST /ai/research → add job to queue → return { jobId }
// Worker picks up job → calls Anthropic API → stores result in Redis (TTL 1hr)
// GET /ai/jobs/:id → check Redis → return result or { status: 'processing' }
```

**4.5 AI prompt injection protection**
Before including user data in prompts:
```typescript
function sanitizeForPrompt(data: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    // Strip anything that looks like prompt injection
    sanitized[key] = value
      .replace(/```/g, '')           // No code blocks
      .replace(/system:/gi, '')       // No system prompt overrides
      .replace(/ignore previous/gi, '') // Common injection
      .substring(0, 2000);            // Length limit per field
  }
  return sanitized;
}
```

**4.6 BYOK key encryption**
When a FREE user saves their API key:
```typescript
// Encrypt with AES-256-GCM before storing in DB
// Key derived from ENCRYPTION_SECRET env var
// Never return decrypted key to frontend
// Use only for proxying (if user switches to a plan that still uses BYOK)
```

### VERIFICATION
```bash
pnpm --filter api test         # AI module tests pass
# Manual: Pro user → open AI Coach → send message → response comes back (no API key needed)
# Manual: FREE user → must enter API key → BYOK flow works
# Manual: Pro user → send 101 requests → 101st returns 429 with reset time
# Manual: Click "AI Research" → loading state → result appears after 15-30s
# Manual: Check Redis → token usage tracked per user
```

---

## SPRINT 5: SERVER-SIDE EXPORTS (Day 27-31)

### GOAL
PDF reports, pitch decks, and public pages generated server-side. Pro-gated. Real .pdf files, not print dialogs.

### PREREQUISITES
Sprint 4 complete. AI proxy works.

### TASKS

**5.1 NestJS Export module**
`apps/api/src/export/`:
```
export.module.ts
export.controller.ts
export.service.ts
pdf.generator.ts          # Uses Puppeteer
pitch-deck.generator.ts   # Uses Puppeteer
templates/
  ├── report.html         # Extract from POC generatePDF() HTML template
  └── pitch-deck.html     # Extract from POC generatePitchDeck() HTML template
```

**5.2 Puppeteer PDF generation (via BullMQ worker)**
```typescript
// POST /export/pdf → validate auth + plan → add to export queue → return { jobId }
// Worker: render HTML template with project data → Puppeteer → PDF → upload to R2 → store URL
// GET /export/jobs/:id → return { status, downloadUrl (signed, expires in 24hr) }
```

Use `@sparticuz/chromium` for serverless-compatible Chromium.

**5.3 Public pages**
`apps/web/src/app/p/[slug]/page.tsx`:
- Server-rendered Next.js page (SSR, not client-side)
- Reads project from DB via public slug
- Shows: startup name, IRS score, stage progress, key metrics, Thiel scorecard
- Footer: "Powered by Validately.io" (removed for Pro users)
- SEO: Open Graph tags, Twitter card, structured data
- Toggle in Share panel: "Make project public" → generates slug → shows URL

**5.4 Cloudflare R2 integration**
- S3-compatible API
- Store generated PDFs and pitch decks
- Signed URLs with 24-hour expiry
- Lifecycle rule: delete files after 30 days

### VERIFICATION
```bash
# Manual: Pro user → click "Export PDF" → loading → downloads real .pdf file
# Manual: Pro user → click "Pitch Deck" → downloads 11-page PDF
# Manual: Toggle "Make Public" → visit /p/my-startup → sees read-only validation page
# Manual: FREE user → clicks Export → sees upgrade prompt
# Manual: Check R2 → files stored with correct names
```

---

## SPRINT 6: ONBOARDING + SNAPSHOTS + TEAM COLLAB (Day 32-38)

### GOAL
First-run experience, version history, and basic team collaboration.

### PREREQUISITES
Sprint 5 complete. Exports work.

### TASKS

**6.1 Onboarding wizard**
`apps/web/src/components/onboarding/OnboardingWizard.tsx`:

3-step flow for new users:
1. "What's your startup idea?" — single textarea
2. AI pre-fills 8 fields from that sentence (startup_name, problem_statement, who_has_problem, why_now, tam_sam_som, value_prop, target_adopter, must_have)
3. User lands in Stage 0 with fields pre-populated, can edit immediately

This is the activation moment. Track: `posthog.capture('onboarding_completed', { fields_prefilled: 8 })`.

**6.2 Snapshots API**
`apps/api/src/snapshots/`:
```
POST   /projects/:id/snapshots      # Create snapshot (auto or manual)
GET    /projects/:id/snapshots      # List snapshots (paginated)
POST   /projects/:id/snapshots/:sid/restore  # Restore snapshot
DELETE /projects/:id/snapshots/:sid  # Delete snapshot
```

Auto-snapshot triggers: stage advancement, before data import. Enforce limits: FREE=5, PRO=50, TEAM=unlimited.

**6.3 Team collaboration (v1 — polling, not WebSockets)**
`apps/api/src/teams/`:
```
POST   /projects/:id/members           # Invite by email (sends Resend email with magic link)
DELETE /projects/:id/members/:userId    # Remove member
PATCH  /projects/:id/members/:userId    # Change role (OWNER/EDITOR/VIEWER)
GET    /projects/:id/members            # List members with roles
```

Collaboration v1 uses optimistic locking (already built into PATCH endpoint via `version` field). When two editors save simultaneously, the second gets a 409 → frontend shows "Someone else made changes. Refresh to see updates."

**6.4 Email templates (Resend)**
- Welcome email (on signup)
- Team invite email (with magic link to project)
- Payment receipt (on Stripe success)
- Subscription canceled (on Stripe cancel)

### VERIFICATION
```bash
# Manual: New signup → onboarding wizard → type idea → 8 fields pre-filled → land in Stage 0
# Manual: Advance stage → snapshot auto-created → visible in Snapshots panel
# Manual: Restore old snapshot → data reverts → version increments
# Manual: Team plan user → invite editor@test.com → they receive email → click link → see project
# Manual: Editor edits field → data saves → owner refreshes → sees changes
# Manual: Viewer can see but cannot edit (fields disabled)
```

---

## SPRINT 7: LANDING PAGE + SEO + LAUNCH PREP (Day 39-45)

### GOAL
Ship it. Public-facing landing page, SEO, legal, final QA.

### PREREQUISITES
Sprints 0-6 complete. Full stack works end-to-end.

### TASKS

**7.1 Landing page**
`apps/web/src/app/page.tsx`:
- Hero: "Validate your startup before you build it" + CTA
- Feature grid: 7 stages visualized
- Social proof: framework logos (BMC, Empathy Map, Thiel's 7 Powers)
- Pricing section (embed from /pricing)
- FAQ
- Footer with links

**7.2 SEO landing pages**
Create 10 framework-specific pages:
```
/tools/business-model-canvas
/tools/value-proposition-canvas
/tools/empathy-map
/tools/startup-validation
/tools/product-market-fit
/tools/lean-canvas
/tools/investor-readiness
/tools/competitive-analysis
/tools/pitch-deck-generator
/tools/startup-idea-validator
```
Each page: explains the framework, shows how Validately implements it, CTA to sign up.

**7.3 Legal**
- `/terms` — Terms of Service
- `/privacy` — Privacy Policy
- Cookie consent banner (minimal — you only use essential cookies + PostHog)

**7.4 Final QA checklist**
- [ ] Full user journey E2E test (Playwright)
- [ ] Stripe live mode configured (switch from test keys)
- [ ] All env vars set in Railway + Vercel
- [ ] Database backups enabled (Railway auto-backup)
- [ ] Sentry capturing errors in production
- [ ] PostHog tracking events in production
- [ ] Custom domain `validately.io` on Vercel
- [ ] API domain `api.validately.io` on Railway
- [ ] SSL certificates active
- [ ] Mobile QA: iPhone Safari, Android Chrome
- [ ] Open Graph image + Twitter Card meta tags
- [ ] Lighthouse score >80 on all metrics
- [ ] README.md with setup instructions

### VERIFICATION
```bash
pnpm test:e2e              # All Playwright tests pass
# Full journey: signup → onboard → fill stages → advance → export PDF → upgrade → hosted AI → invite team → share public page
# Stripe: complete real $1 test purchase → verify webhook → verify plan update
# SEO: check /tools/business-model-canvas loads, has meta tags
# Mobile: full flow on real iPhone and Android
```

---

## AFTER LAUNCH: ITERATION PRIORITIES

Once live with real users, prioritize based on PostHog data:

1. **Where do users drop off?** — If Stage 2 has 40% abandonment, the Define stage needs UX work
2. **Which AI triggers fire most?** — Double down on the coaching patterns users value
3. **What's the free-to-Pro conversion rate?** — If <2%, the gate is wrong. If >10%, you're leaving money on the table
4. **Are public pages driving signups?** — Track referral source in PostHog
5. **What's the average time-to-IRS-100?** — This is your "time to value" metric

When scaling demands it (>1000 users or >100 concurrent AI requests):
- Add WebSockets for real-time collaboration (replace polling)
- Add Redis caching layer for project reads
- Add CDN for public pages
- Consider moving to dedicated Postgres (from Railway shared)
- Consider edge functions for public page rendering
