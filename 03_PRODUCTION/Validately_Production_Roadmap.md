# Validately.io — Production-Ready Roadmap

## Context

Validately.io is currently a **2,068-line single HTML file** with all React components, state, AI integration, and business logic in one place. It works, but it's a POC. The goal is to transform it into a production SaaS that can charge $19-49/mo, serve teams, and scale.

**Design philosophy: Scale-ready from day 1.** Slightly over-engineered is fine. We do NOT want a "rewrite everything at month 3" scenario. Proper separation of concerns, proper backend, proper infrastructure from Sprint 0.

---

## Technology Stack (Final)

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 15 (App Router, TypeScript, Tailwind CSS) | SSR, file-based routing, Vercel-native |
| Backend API | NestJS (TypeScript, modular, decorator-based DI) | Scale-ready, modular, strong typing |
| Database | PostgreSQL 16 (via Prisma ORM) | JSONB for 101-field data blob, relational for users/teams |
| Cache/Sessions | Redis (Upstash serverless for dev, managed for prod) | Rate limiting, AI usage tracking, BullMQ backing |
| Queue/Workers | BullMQ (backed by Redis) | AI research jobs, PDF generation, email |
| Object Storage | Cloudflare R2 (S3-compatible, zero egress) | Generated PDFs, pitch decks, exports |
| Payments | Stripe (Checkout, Customer Portal, Webhooks) | Industry standard, handles subscriptions |
| Auth | NextAuth.js v5 (Auth.js) — Google OAuth + email magic links | Stateless JWT, Prisma adapter |
| Email | Resend | Transactional: welcome, invites, receipts |
| Hosting | Vercel (frontend) + Railway (API + workers + Redis + Postgres) | Vercel for edge, Railway for persistent services |
| Monitoring | Sentry (errors) + Pino (structured logs) + PostHog (product analytics) | Full observability stack from day 1 |
| Testing | Vitest (unit) + Playwright (E2E) + Supertest (API integration) | Testing from day 1 |
| Monorepo | Turborepo with pnpm workspaces | Shared packages across frontend + backend |

**Priority: Revenue first** — Stripe + Pro tier gating is the critical path (Sprint 3). But the architecture supports team collaboration and scale from the beginning.

**AI model: Hybrid** — Free users bring their own API key (direct browser calls). Pro/Team users get hosted AI through the backend (you pay, they don't need a key).

---

## Sprint Overview (45 Days)

| Sprint | What | Days | Calendar | Priority |
|--------|------|------|----------|----------|
| 0 | Monorepo Scaffolding + Infrastructure | 3 | Day 1-3 | Must |
| 1 | Database + Auth + Shared Logic Extraction | 5 | Day 4-8 | Must |
| 2 | Project CRUD + Auto-Save + PostHog | 6 | Day 9-14 | Must |
| 3 | Stripe + Pro Tier Gating | 6 | Day 15-20 | Must ⭐ |
| 4 | AI Proxy + Hosted AI | 6 | Day 21-26 | High |
| 5 | Server-Side Exports | 5 | Day 27-31 | High |
| 6 | Onboarding + Snapshots + Team Collab | 7 | Day 32-38 | Medium |
| 7 | Landing Page + SEO + Launch Prep | 7 | Day 39-45 | Must |

**Fastest path to revenue: Sprints 0→1→2→3 (20 days)** — at that point you have auth, cloud save, and Stripe payments. You can launch MVP with client-side exports and BYOK AI, then layer on Sprints 4-6.

**What's different from the original 28-day plan:**
- Infrastructure, observability, and testing frameworks wired from Sprint 0 (not bolted on at the end)
- NestJS backend from day 1 (not "start with Next.js API Routes, add NestJS later")
- PostHog product analytics from Sprint 2 (not post-launch)
- Onboarding wizard and data migration bridge included (not forgotten)
- Realistic timeline: 45 days, not 28

---

## Sprint 0: Monorepo Scaffolding + Infrastructure (Day 1-3)

**Goal:** Set up the entire project skeleton so every subsequent sprint just adds code to existing structure. Infrastructure, CI, linting, testing frameworks — all wired before writing business logic.

**Key outputs:**
- Turborepo monorepo with `apps/web` (Next.js), `apps/api` (NestJS), `packages/shared`, `packages/db`
- ESLint + Prettier + TypeScript strict mode everywhere
- Sentry configured in both apps
- Pino structured logging in API
- Vitest + Playwright + Supertest test runners configured
- `.env.example` with all 15+ environment variables documented

**Verify:** `pnpm dev` starts both apps, `pnpm build` succeeds, `pnpm test` runs (0 tests is fine), `curl localhost:4000/health` returns OK.

---

## Sprint 1: Database + Auth + Shared Logic (Day 4-8)

**Goal:** Database schema, authentication, and ALL shared business logic extracted from POC with comprehensive tests.

**Key outputs:**

### Prisma Schema
Models: User, Project, Snapshot, TeamMember. Enums: Plan (FREE/PRO/TEAM), TeamRole (OWNER/EDITOR/VIEWER).

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  avatar          String?
  plan            Plan      @default(FREE)
  stripeId        String?   @unique
  apiKey          String?                    // Encrypted BYOK key
  onboardingDone  Boolean   @default(false)
  aiRequestsToday Int       @default(0)
  aiRequestsReset DateTime  @default(now())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  projects        Project[]
  teamMembers     TeamMember[]
}

model Project {
  id            String    @id @default(cuid())
  name          String    @default("Untitled Startup")
  data          Json      @default("{}")   // All 101 stage fields as JSONB
  stageIdx      Int       @default(0)
  unlocked      Int[]     @default([0])
  xp            Int       @default(0)
  version       Int       @default(0)      // Optimistic locking
  irsScore      Int       @default(0)      // Cached IRS for queries
  irsBand       String    @default("Pre-Seed")
  isPublic      Boolean   @default(false)
  publicSlug    String?   @unique
  ownerId       String
  owner         User      @relation(fields: [ownerId], references: [id])
  snapshots     Snapshot[]
  teamMembers   TeamMember[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([ownerId])
  @@index([publicSlug])
}

model Snapshot {
  id            String    @id @default(cuid())
  name          String
  data          Json
  stageIdx      Int
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())

  @@index([projectId])
}

model TeamMember {
  id            String    @id @default(cuid())
  role          TeamRole  @default(VIEWER)
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())

  @@unique([userId, projectId])
}

enum Plan { FREE  PRO  TEAM }
enum TeamRole { OWNER  EDITOR  VIEWER }
```

### Shared Logic Extraction
Extract from `02_POC/Validately.html` into `packages/shared/src/`:

| POC Source | New Location | Tests Required |
|-----------|-------------|----------------|
| `qScore()` (lines 71-81) | `scoring/qScore.ts` | 10+ tests: empty, buzzwords, specificity, evidence, action words |
| `calcIRS()` (lines 837-867) | `scoring/calcIRS.ts` | Tests for each IRS band boundary |
| `runXV()` + VCHECKS | `scoring/runXV.ts` | 16 validation check tests |
| GATE_CRITERIA (lines 188-313) | `gates/criteria.ts` | Gate type validation tests |
| PROACTIVE_TRIGGERS (lines 163-185) | `triggers/proactive.ts` | Trigger condition tests |
| GENIE_TRIGGERS | `triggers/genie.ts` | Regex pattern tests |
| C colors (lines 40-50) | `constants/colors.ts` | — |
| STAGE_META (lines 59-68) | `constants/stages.ts` | — |
| PRICING_TIERS (lines 53-57) | `constants/pricing.ts` | — |
| All 101 fields | `types/project.ts` | TypeScript interface with JSDoc |

**CRITICAL: Run `pnpm --filter shared test` after each extraction. Every scoring function must have passing tests before moving on.**

### Authentication
- NextAuth.js v5 with Google OAuth + Resend magic links
- JWT strategy (stateless)
- Middleware protects `/workspace/*`, `/settings/*`, `/api/*` (except auth/public/webhook)
- Public routes: `/`, `/pricing`, `/p/[slug]`, `/api/auth/*`, `/api/public/*`
- NestJS auth module: JWT verification, `@CurrentUser()` decorator, `AuthGuard`, `PlanGuard`

**Verify:** All shared logic tests pass. Schema applies. Auth works with Google + email.

---

## Sprint 2: Project CRUD + Auto-Save + Product Analytics (Day 9-14)

**Goal:** Users can create projects, edit fields, and data persists to Postgres with auto-save. Product analytics track every meaningful action.

**Key outputs:**

### API Endpoints
```
POST   /projects              # Create (enforce plan limits: FREE=1, PRO=5, TEAM=unlimited)
GET    /projects              # List (paginated, sorted by updatedAt)
GET    /projects/:id          # Get (auth: owner or team member)
PATCH  /projects/:id          # Update (JSONB merge, version increment, optimistic lock)
DELETE /projects/:id          # Soft delete (set deletedAt)
POST   /projects/:id/advance  # Advance stage (SERVER validates gates)
GET    /projects/:id/public   # Public view (no auth, only if isPublic=true)
```

### Frontend Architecture
- Zustand store for local state (instant UI updates)
- React Query for server state (auto-save, cache invalidation)
- `useAutoSave` hook: debounce 1.5s, PATCH to server, handle 409 conflicts
- Offline fallback: queue in localStorage, retry every 30s
- SaveIndicator component: saved/saving/error/offline states

### Component Migration
Convert POC components from `React.createElement()` to TypeScript JSX:
- SmartField, SelectField, BenchmarkBar, QualityBadge, ProgressRing (UI)
- Stage0Diagnose through Stage6Dominate (7 stage components)
- DashboardShell, StageNav, TopBar (layout)

### PostHog Events (from day 1)
Track: project_created, field_edited, stage_advanced, gate_check_failed, ai_coach_triggered, export_clicked, upgrade_prompt_shown.

### Data Migration Bridge
On first login, detect `localStorage.validately_data` → offer import to cloud account.

**Verify:** Create project → edit field → refresh → data persists from server. Conflict warning on simultaneous edits. PostHog events appearing.

---

## Sprint 3: Stripe + Pro Tier Gating (Day 15-20) ⭐ REVENUE

**Goal:** Users can upgrade to Pro via Stripe Checkout. Pro features are gated. Revenue starts flowing.

**Key outputs:**

### Stripe Setup
- Products: "Validately Pro" ($19/mo), "Validately Team" ($49/mo)
- Stripe Checkout for upgrade flow
- Customer Portal for billing management
- Webhook handler for subscription lifecycle events

### API Endpoints
```
POST  /billing/checkout      # Create Checkout Session
POST  /billing/portal        # Create Customer Portal Session
POST  /billing/webhook       # Handle Stripe events (signature-verified, not session auth)
GET   /billing/status        # Get subscription status
```

### Feature Gating

| Feature | FREE | PRO ($19) | TEAM ($49) |
|---------|------|-----------|------------|
| All 7 stages + fields | ✅ | ✅ | ✅ |
| AI Coach (BYOK) | ✅ | ✅ | ✅ |
| Quality scoring + gates | ✅ | ✅ | ✅ |
| XP + gamification | ✅ | ✅ | ✅ |
| Projects | 1 | 5 | Unlimited |
| JSON export/import | ✅ | ✅ | ✅ |
| Hosted AI (no key needed) | ❌ | ✅ | ✅ |
| PDF Investor Report | ❌ | ✅ | ✅ |
| Pitch Deck generator | ❌ | ✅ | ✅ |
| Public page | With branding | No branding | No branding |
| AI Market Research | ❌ | ✅ | ✅ |
| Snapshots | 5 | 50 | Unlimited |
| Team collaboration | ❌ | ❌ | Up to 5 members |
| White-label exports | ❌ | ❌ | ✅ |

**Key design decision:** Public pages are FREE with branding. This is the growth loop — every shared page is marketing.

### Webhook Integration Tests
Simulate: checkout.session.completed → plan upgrade, subscription.deleted → downgrade, payment_failed → flag. Verify signature validation rejects invalid requests.

**Verify:** Stripe test mode → complete payment → plan changes → features unlock. Cancel → revert. FREE user sees upgrade prompt on gated features.

---

## Sprint 4: AI Proxy + Hosted AI (Day 21-26)

**Goal:** Pro/Team users get AI coaching without their own API key. Rate-limited, cost-controlled.

**Key outputs:**

### Dual-Mode Architecture
```
FREE user:  Browser → Anthropic API (direct, user's BYOK key)
PRO user:   Browser → Your API → Redis queue → Worker → Anthropic API → Response
```

### API Endpoints
```
POST  /ai/chat       # AI Coach message (sync, <10s)
POST  /ai/research   # Market research (async via BullMQ, 15-30s)
POST  /ai/review     # Proactive field review (sync, <10s)
GET   /ai/jobs/:id   # Check async job status
GET   /ai/usage      # Get daily AI request count
```

### Rate Limits (Redis)
- FREE: 0 hosted requests (must BYOK)
- PRO: 100 requests/day, max 1000 tokens/request
- TEAM: 500 requests/day, max 2000 tokens/request

### Cost Model
~$0.003/request × 100/day × 30 days = ~$9/user/month. Margin: $10/user on Pro plan.

### Security
- AI prompt injection sanitization (strip code blocks, system overrides, length limits)
- BYOK key encryption with AES-256-GCM before DB storage
- Never return decrypted keys to frontend

**Verify:** Pro user chats without API key. Rate limit blocks 101st request. Research jobs complete via queue.

---

## Sprint 5: Server-Side Exports (Day 27-31)

**Goal:** PDF reports, pitch decks, and public pages generated server-side. Pro-gated. Real .pdf files.

**Key outputs:**

### Architecture
```
Export PDF → API → BullMQ worker → Render HTML template → Puppeteer → PDF → Upload R2 → Signed URL
```

### API Endpoints
```
POST  /export/pdf          # Generate investor report PDF
POST  /export/pitch-deck   # Generate pitch deck PDF (11 pages)
POST  /export/public-page  # Generate/update public page
GET   /export/jobs/:id     # Check job status, get download URL
```

### Public Pages (SSR)
- `validately.io/p/[slug]` — server-rendered Next.js page
- Shows: startup name, IRS score, stage progress, key metrics, Thiel scorecard
- SEO-optimized: Open Graph, Twitter Card, structured data
- Footer: "Powered by Validately.io" (removed for Pro)

### Storage
- Cloudflare R2 (S3-compatible, zero egress fees)
- Signed URLs with 24-hour expiry
- 30-day lifecycle rule for cleanup

**Verify:** Export produces real .pdf file. Public page loads at /p/slug. Toggle on/off works.

---

## Sprint 6: Onboarding + Snapshots + Team Collab (Day 32-38)

**Goal:** First-run experience, version history, and basic team collaboration.

**Key outputs:**

### Onboarding Wizard (3 steps)
1. "What's your startup idea?" — single textarea
2. AI pre-fills 8 fields from that sentence
3. User lands in Stage 0 with fields pre-populated

This is the activation moment. Track: `onboarding_completed` event.

### Snapshots API
```
POST   /projects/:id/snapshots              # Create (auto or manual)
GET    /projects/:id/snapshots              # List (paginated)
POST   /projects/:id/snapshots/:sid/restore # Restore
DELETE /projects/:id/snapshots/:sid         # Delete
```
Auto-snapshot on: stage advancement, data import. Limits: FREE=5, PRO=50, TEAM=unlimited.

### Team Collaboration v1
- Invite by email (Resend magic link)
- Roles: Owner, Editor, Viewer
- Optimistic locking (version field) — no WebSockets yet
- Conflict: "Someone else made changes. Refresh to see updates."

### Email Templates (Resend)
Welcome, team invite, payment receipt, subscription canceled.

**Verify:** Onboarding pre-fills fields. Snapshots auto-create. Team invite flow works. Conflict warning appears.

---

## Sprint 7: Landing Page + SEO + Launch Prep (Day 39-45)

**Goal:** Ship it. Public-facing landing page, SEO, legal, final QA.

**Key outputs:**

### Landing Page
Hero + feature grid + framework logos + pricing + FAQ + footer.

### SEO Landing Pages (10 framework-specific)
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

### Legal
Terms of Service, Privacy Policy, cookie consent.

### Launch Checklist
- [ ] Custom domain `validately.io` on Vercel
- [ ] API domain `api.validately.io` on Railway
- [ ] Stripe live mode keys
- [ ] All env vars in production
- [ ] Database backups enabled
- [ ] Sentry capturing errors
- [ ] PostHog tracking events
- [ ] SSL certificates
- [ ] Mobile QA (iPhone Safari, Android Chrome)
- [ ] Open Graph image + Twitter Card
- [ ] Lighthouse score >80
- [ ] Full E2E Playwright test passing

**Verify:** Full user journey works end-to-end. Stripe live payment succeeds. Mobile works. SEO pages load.

---

## Files to Migrate from POC

These are the logical modules to extract from the current 2,068-line `02_POC/Validately.html`:

| Current Code | New Location | Approx Lines |
|---|---|---|
| `C` color constants | `packages/shared/src/constants/colors.ts` | 10 |
| `STAGE_META`, `STAGES` array | `packages/shared/src/constants/stages.ts` | 50 |
| `GATE_CRITERIA` | `packages/shared/src/gates/criteria.ts` | 120 |
| `PROACTIVE_TRIGGERS`, `GENIE_TRIGGERS` | `packages/shared/src/triggers/` | 50 |
| `VCHECKS` | `packages/shared/src/scoring/runXV.ts` | 30 |
| `qScore()`, `calcIRS()`, `runXV()` | `packages/shared/src/scoring/` | 80 |
| `AI_SYS` prompt | `apps/api/src/ai/prompts.ts` | 60 |
| `PRICING_TIERS` | `packages/shared/src/constants/pricing.ts` | 15 |
| `SF`, `SEL`, `Benchmark`, `QBadge`, `Ring` | `apps/web/src/components/ui/` | 150 |
| Stage 0-6 render functions | `apps/web/src/components/stages/` | 500 |
| `GeniePanel` | `apps/web/src/components/ai/GeniePanel.tsx` | 80 |
| `ResearchPanel` | `apps/web/src/components/ai/ResearchPanel.tsx` | 100 |
| `SharePanel`, `SnapshotPanel` | `apps/web/src/components/modals/` | 170 |
| `PricingModal`, `SettingsModal` | `apps/web/src/components/modals/` | 80 |
| `generatePDF`, `generatePitchDeck`, `generatePublicPage` | `apps/api/src/export/templates/` | 300 |
| `App` component | `apps/web/src/app/(dashboard)/workspace/page.tsx` | 250 |
| `Assess` component | `apps/web/src/components/stages/Assess.tsx` | 50 |

---

## After Launch: Iteration Priorities

Once live with real users, prioritize based on PostHog data:

1. **Where do users drop off?** — If Stage 2 has 40% abandonment, the Define stage needs UX work
2. **Which AI triggers fire most?** — Double down on the coaching patterns users value
3. **What's the free-to-Pro conversion rate?** — If <2%, the gate is wrong. If >10%, leaving money on the table
4. **Are public pages driving signups?** — Track referral source in PostHog
5. **What's the average time-to-IRS-100?** — This is your "time to value" metric

When scaling demands it (>1000 users or >100 concurrent AI requests):
- Add WebSockets for real-time collaboration (replace polling)
- Add Redis caching layer for project reads
- Add CDN for public pages
- Consider dedicated Postgres (from Railway shared)
- Consider edge functions for public page rendering

---

## Document Hierarchy

This roadmap is the **high-level overview**. For sprint-by-sprint execution instructions with exact file paths, code patterns, and verification steps, see:

→ **`CLAUDE_CODE_INSTRUCTIONS.md`** (the authoritative build spec for Claude Code)
