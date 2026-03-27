# Validately — Operations Playbook
## Complete Guide: Development → Staging → Production

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Environment Strategy](#2-environment-strategy)
3. [Cloud Deployment Guide](#3-cloud-deployment-guide)
4. [CI/CD Pipeline](#4-cicd-pipeline)
5. [Testing Strategy](#5-testing-strategy)
6. [Monitoring & Observability](#6-monitoring--observability)
7. [Project Management Workflow](#7-project-management-workflow)
8. [Security Checklist](#8-security-checklist)
9. [Cost Breakdown](#9-cost-breakdown)
10. [Launch Checklist](#10-launch-checklist)
11. [Day-to-Day Operations](#11-day-to-day-operations)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      USERS (Browser)                     │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
         Port 3000               Port 4000
               │                      │
┌──────────────▼──────┐  ┌───────────▼───────────────────┐
│   Next.js 15 (Web)  │  │    NestJS 10 (API)            │
│                      │  │                                │
│  • 7 pages           │  │  • 34 REST endpoints           │
│  • 28 components     │  │  • JWT auth (Passport)         │
│  • NextAuth v5       │  │  • Rate limiting               │
│  • Zustand store     │  │  • Optimistic locking          │
│  • TailwindCSS       │  │  • Plan-based gating           │
│  • React Query       │  │  • Input sanitization          │
└──────────┬───────────┘  └──┬──────┬──────┬──────┬───────┘
           │                 │      │      │      │
     ┌─────▼─────┐   ┌──────▼──┐ ┌─▼──┐ ┌─▼──┐ ┌─▼────────┐
     │  Prisma   │   │Postgres │ │Redis│ │ AI │ │  Stripe   │
     │  Client   │   │  (DB)   │ │    │ │Claude│ │ Payments  │
     └───────────┘   └─────────┘ └────┘ └────┘ └──────────┘
                                                  │
                                          ┌───────▼──────┐
                                          │  Resend      │
                                          │  (Email)     │
                                          └──────────────┘
```

### What's production-ready (95%)
- 7 web pages, 28 components — all complete
- 34 API endpoints — all functional
- Auth: Google OAuth + magic link email
- Billing: Stripe checkout + portal + webhooks
- AI: Claude chat, research, field review (BYOK supported)
- Teams: Invite, roles (OWNER/EDITOR/VIEWER), permissions
- Scoring: IRS calculation, cross-validation, gate checking
- Snapshots: Save/restore project states

### What's stubbed (5%)
- PDF export templates (infrastructure ready, templates empty)
- Pitch deck generation (same — queuing works, no template)

---

## 2. Environment Strategy

### Three Environments

| Environment | Purpose | Branch | URL | Database |
|------------|---------|--------|-----|----------|
| **Development** | Local coding/debugging | `feature/*` | `localhost:3000/4000` | Local PostgreSQL |
| **Staging** | QA, demo, pre-launch testing | `staging` | `staging.validately.app` | Separate DB instance |
| **Production** | Live users | `main` | `app.validately.app` | Production DB (backups!) |

### Branch Strategy (GitHub Flow)

```
main (production)
  └── staging (pre-production QA)
       └── feature/xyz (development)
```

**Rules:**
1. All work happens on `feature/*` branches
2. PR into `staging` → auto-deploys to staging environment
3. PR from `staging` into `main` → auto-deploys to production
4. Never push directly to `main` or `staging`
5. `staging` gets reset from `main` weekly (or after each release)

### Environment Variables Per Environment

| Variable | Development | Staging | Production |
|----------|------------|---------|------------|
| `DATABASE_URL` | `localhost:5432` | Managed DB (staging) | Managed DB (prod) |
| `REDIS_URL` | `localhost:6379` | Managed Redis | Managed Redis |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://staging.validately.app` | `https://app.validately.app` |
| `NEXTAUTH_SECRET` | Dev value | Unique per env | Unique per env |
| `JWT_SECRET` | Dev value | Unique per env | Unique per env |
| `STRIPE_SECRET_KEY` | Test mode key | Test mode key | **Live mode key** |
| `ANTHROPIC_API_KEY` | Your key or empty | Platform key | Platform key |
| `RESEND_API_KEY` | Empty (no emails) | Test domain | Production domain |
| `SENTRY_DSN` | Empty | Staging project | Production project |

**Critical:** Staging uses Stripe TEST mode keys. Production uses LIVE mode keys.

---

## 3. Cloud Deployment Guide

### Recommended Stack: Railway (simplest) or DigitalOcean (cheapest at scale)

#### Option A: Railway (Best for MVP — $5-20/mo)

**Why:** One-click deploy, built-in PostgreSQL + Redis, auto-deploys from GitHub.

```bash
# 1. Install Railway CLI
npm install -g @railway/cli
railway login

# 2. Create project with services
railway init
railway add --database postgres
railway add --database redis

# 3. Deploy API
cd apps/api
railway up --service api

# 4. Deploy Web
cd ../web
railway up --service web

# 5. Set environment variables in Railway dashboard
# DATABASE_URL and REDIS_URL are auto-injected
```

**Railway Pricing (March 2026):**
- Hobby: $5/mo (includes $5 credit) — enough for MVP
- Pro: $20/mo (includes $20 credit) — enough for 1000 users
- PostgreSQL: ~$0.000018/min (~$0.78/mo idle)
- Redis: ~$0.000018/min (~$0.78/mo idle)
- **Total MVP: ~$7-10/mo**

#### Option B: DigitalOcean (Best at Scale — $12-48/mo)

```bash
# 1. Create Droplet ($6/mo) or App Platform
doctl apps create --spec .do/app.yaml

# 2. Managed PostgreSQL ($15/mo basic)
# 3. Managed Redis ($15/mo basic)
# Total: ~$36/mo but scales better
```

#### Option C: Vercel (Frontend) + Railway (Backend) — Hybrid

```bash
# Frontend on Vercel (free tier)
cd apps/web
vercel --prod

# Backend on Railway
cd apps/api
railway up
```

**Best of both worlds:** Vercel's edge network for the frontend, Railway for the API.

### Docker Deployment (Any VM)

Already set up in the repo:

```bash
# On any VM with Docker installed:
git clone <repo> && cd 03_PRODUCTION/validately

# Edit .env.docker with real values
nano .env.docker

# Launch everything
docker compose up --build -d

# Check status
docker compose ps
docker compose logs -f api
docker compose logs -f web

# Run database migrations
docker compose exec api npx prisma db push --schema=packages/db/prisma/schema.prisma
```

---

## 4. CI/CD Pipeline

### GitHub Actions — Free for public repos, 2000 min/mo for private

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]

env:
  DATABASE_URL: postgresql://test:test@localhost:5432/test
  JWT_SECRET: test-secret-for-ci-only
  NEXTAUTH_SECRET: test-secret-for-ci-only

jobs:
  # ─── Lint & Type Check ───
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx turbo lint

  # ─── Unit Tests ───
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx prisma db push --schema=packages/db/prisma/schema.prisma
      - run: npx turbo test

  # ─── Deploy Staging ───
  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    needs: [quality, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway (staging)
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN_STAGING }}
          service: api

  # ─── Deploy Production ───
  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [quality, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway (production)
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN_PRODUCTION }}
          service: api
```

### Deployment Flow

```
Developer pushes to feature/xyz
    │
    ▼
PR opened → CI runs (lint + test)
    │
    ▼ (PR merged into staging)
    │
Auto-deploy to staging.validately.app
    │
    ▼ (QA passes, PR merged into main)
    │
Auto-deploy to app.validately.app
```

---

## 5. Testing Strategy

### Test Pyramid

```
        ┌──────────┐
        │  E2E (5) │  ← Playwright: login, create project, autosave, export, billing
        ├──────────┤
        │ Integration│  ← Supertest: all 34 API endpoints
        │   (34)    │
        ├──────────┤
        │  Unit     │  ← Vitest: scoring, gates, validation, crypto
        │  (50+)    │
        └──────────┘
```

### What exists now
- **Unit tests:** 4 test files covering scoring (qScore, calcIRS, runXV) and gate validation
- **Integration:** Supertest installed but no test files yet

### What to add (priority order)

**Phase 1 — Before Launch (1-2 days):**
1. API integration tests for auth flow (login → get token → access protected route)
2. API integration tests for project CRUD (create → update → get score → delete)
3. API integration tests for version conflict handling

**Phase 2 — After Launch (1 week):**
4. E2E test: Sign up → onboarding → create project → fill stage 1 → advance
5. E2E test: Billing flow (Stripe test mode)
6. E2E test: Team invite → accept → edit project
7. API tests for all remaining endpoints

**Phase 3 — Ongoing:**
8. Snapshot testing for UI components
9. Load testing for autosave endpoint (most hit endpoint)
10. Security testing (JWT tampering, XSS in project data, SQL injection via Prisma)

### Running Tests

```bash
# All tests
npx turbo test

# Shared package only
cd packages/shared && npx vitest run

# API integration tests
cd apps/api && npx vitest run

# E2E (when added)
cd apps/web && npx playwright test
```

---

## 6. Monitoring & Observability

### Free Tier Stack

| Tool | Purpose | Free Tier | Setup |
|------|---------|-----------|-------|
| **Sentry** | Error tracking | 5K events/mo | Set `SENTRY_DSN` |
| **PostHog** | Analytics + session replay | 1M events/mo | Set `NEXT_PUBLIC_POSTHOG_KEY` |
| **UptimeRobot** | Uptime monitoring | 50 monitors | Add `/health` endpoint |
| **Pino** (built-in) | Structured logging | Unlimited | Already configured |
| **Railway Metrics** | CPU/memory/requests | Included | Built into dashboard |

### Key Metrics to Track

**Business Metrics (PostHog):**
- Daily/Weekly active users
- Projects created per user
- Stage completion rate (funnel: Stage 0 → Stage 6)
- AI feature usage (chat, research, review)
- Conversion rate (FREE → PRO)
- Churn rate

**Technical Metrics (Sentry + Pino):**
- API response times (p50, p95, p99)
- Error rate per endpoint
- Autosave success/failure rate
- Version conflict frequency
- Export job completion time

### Alert Setup

```
Critical (PagerDuty/SMS):
  - API down (health check fails 3x)
  - Database connection errors
  - Error rate > 5% for 5 minutes

Warning (Slack/Email):
  - API p95 latency > 2s
  - Export job failure rate > 10%
  - Stripe webhook failures
  - Redis connection lost
```

---

## 7. Project Management Workflow

### Recommended Tool: Linear (free for small teams) or GitHub Projects (free)

### Issue Categories

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | Red | Something broken |
| `feature` | Blue | New functionality |
| `infra` | Purple | DevOps, CI/CD, deployment |
| `security` | Orange | Security issues (high priority) |
| `ux` | Green | UI/UX improvements |
| `ai` | Cyan | AI feature work |

### Sprint Cadence

**2-week sprints:**

```
Week 1: Development
  Mon: Sprint planning (pick issues, assign)
  Tue-Fri: Build features, fix bugs

Week 2: Polish & Ship
  Mon-Wed: Continue development
  Thu: Code freeze, deploy to staging
  Fri: QA on staging, fix blockers, deploy to production
```

### Pre-Launch Roadmap

```
┌─────────────────────────────────────────────────────────────┐
│ WEEK 1: Infrastructure                                       │
│ □ Set up Railway/DigitalOcean accounts                      │
│ □ Deploy staging environment                                 │
│ □ Configure all environment variables                        │
│ □ Set up custom domain (validately.app)                      │
│ □ Configure Stripe test mode                                 │
│ □ Set up Sentry + PostHog                                    │
│ □ Create GitHub Actions CI/CD pipeline                       │
├─────────────────────────────────────────────────────────────┤
│ WEEK 2: Testing & QA                                         │
│ □ Write API integration tests (auth + projects)              │
│ □ Test all 34 endpoints on staging                           │
│ □ Test auth flow (Google + magic link)                       │
│ □ Test billing flow (Stripe test mode)                       │
│ □ Test team features                                         │
│ □ Fix any bugs found                                         │
│ □ Implement PDF export template                              │
├─────────────────────────────────────────────────────────────┤
│ WEEK 3: Polish & Security                                    │
│ □ Security review (JWT, encryption, CORS, XSS)              │
│ □ Performance testing (autosave under load)                  │
│ □ Set up database backups                                    │
│ □ Configure rate limiting (Redis)                            │
│ □ SSL certificates (Let's Encrypt / Cloudflare)              │
│ □ Set up monitoring alerts                                   │
│ □ Create user onboarding email sequence (Resend)             │
├─────────────────────────────────────────────────────────────┤
│ WEEK 4: Launch                                               │
│ □ Final QA on staging                                        │
│ □ Switch Stripe to LIVE mode                                 │
│ □ Deploy to production                                       │
│ □ Smoke test all critical flows                              │
│ □ Set up UptimeRobot                                         │
│ □ Announce launch                                            │
│ □ Monitor for 48 hours                                       │
└─────────────────────────────────────────────────────────────┘
```

### Post-Launch Priorities

1. **User feedback collection** — in-app feedback widget
2. **PDF/Pitch deck export** — complete the stubbed templates
3. **Mobile optimization** — responsive improvements
4. **API documentation** — Swagger/OpenAPI for the 34 endpoints
5. **Rate limiting tuning** — adjust based on real usage patterns

---

## 8. Security Checklist

### Before Production

- [ ] Generate unique `NEXTAUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Generate unique `JWT_SECRET` (`openssl rand -base64 48`)
- [ ] Generate unique `ENCRYPTION_SECRET` (`openssl rand -base64 32`)
- [ ] Remove hardcoded secrets from `.env` (use environment variables)
- [ ] Ensure `.env` is in `.gitignore` (already done)
- [ ] Configure CORS to only allow your domain
- [ ] Enable HTTPS (SSL/TLS) on all endpoints
- [ ] Set `NODE_ENV=production`
- [ ] Review Stripe webhook signature verification
- [ ] Test rate limiting is active (Redis required)
- [ ] Verify Prisma doesn't expose raw SQL errors to clients
- [ ] Check CSP headers on Next.js responses
- [ ] Audit npm dependencies (`npm audit`)

### Ongoing

- [ ] Rotate secrets quarterly
- [ ] Monitor Sentry for new error patterns
- [ ] Keep dependencies updated (Dependabot)
- [ ] Review access logs monthly
- [ ] Backup database daily (automated)

---

## 9. Cost Breakdown

### MVP Phase (~100 users) — $10-20/mo

| Service | Provider | Monthly Cost |
|---------|----------|-------------|
| API + Web hosting | Railway Hobby | $5 |
| PostgreSQL | Railway (managed) | $1-3 |
| Redis | Railway (managed) | $1-3 |
| Domain | Cloudflare | $10/yr ≈ $1 |
| Email (magic links) | Resend Free | $0 (100 emails/day) |
| Error tracking | Sentry Free | $0 (5K events) |
| Analytics | PostHog Free | $0 (1M events) |
| Uptime monitoring | UptimeRobot Free | $0 |
| AI (Anthropic) | User BYOK or platform | $0-50 (usage) |
| **Total** | | **~$10-15/mo** |

### Growth Phase (~1000 users) — $50-100/mo

| Service | Provider | Monthly Cost |
|---------|----------|-------------|
| API + Web hosting | Railway Pro | $20 |
| PostgreSQL | Railway (2GB) | $10-15 |
| Redis | Railway (256MB) | $5-10 |
| Domain + CDN | Cloudflare | $1 |
| Email | Resend Pro | $20 (50K emails) |
| Error tracking | Sentry Team | $26 (50K events) |
| Analytics | PostHog Free | $0 (still under 1M) |
| AI (Anthropic) | Platform key | $50-200 (usage) |
| **Total** | | **~$80-150/mo** |

### Scale Phase (~10K users) — $300-800/mo

| Service | Provider | Monthly Cost |
|---------|----------|-------------|
| Hosting | DigitalOcean (2x $24 droplets) | $48 |
| PostgreSQL | DO Managed ($60) | $60 |
| Redis | DO Managed ($15) | $15 |
| CDN | Cloudflare Pro | $20 |
| Email | Resend Business | $50 |
| Monitoring | Sentry Business | $80 |
| Analytics | PostHog (paid) | $0 (likely still free) |
| AI | Platform key | $200-1000 |
| **Total** | | **~$400-800/mo** |

---

## 10. Launch Checklist

### T-7 Days (1 week before)

```
□ All CI/CD pipelines green
□ Staging fully tested by at least 2 people
□ Database migrations applied cleanly
□ All environment variables set in production
□ SSL certificate active
□ Custom domain configured
□ Stripe LIVE mode webhook configured
□ Sentry alerts set up
□ UptimeRobot configured
□ Database backup schedule confirmed
□ Rollback plan documented
```

### T-0 (Launch Day)

```
□ Deploy to production
□ Smoke test: signup → create project → fill stage 1 → save → logout → login
□ Smoke test: billing flow (if applicable)
□ Verify health endpoint: curl https://api.validately.app/health
□ Verify Sentry receives test error
□ Verify PostHog tracks page view
□ Monitor error rate for 2 hours
□ Announce launch
```

### T+1 (Day After)

```
□ Check Sentry for new errors
□ Check PostHog for user activity
□ Review API response times
□ Check database size/connections
□ Respond to any user feedback
```

---

## 11. Day-to-Day Operations

### Daily (5 minutes)

- Check Sentry dashboard for new errors
- Check UptimeRobot for any downtime
- Glance at PostHog for user activity trends

### Weekly (30 minutes)

- Review PostHog analytics (signups, feature usage, funnel)
- Check Railway/hosting resource usage
- Review and prioritize bug reports
- `npm audit` for security vulnerabilities
- Database size check

### Monthly (2 hours)

- Review and update dependencies
- Rotate API keys if needed
- Review Stripe revenue metrics
- Plan next sprint priorities
- Database backup restoration test
- Cost optimization review

### Quarterly

- Security audit
- Performance benchmarking
- Dependency major version updates
- Infrastructure scaling review

---

## Quick Reference Commands

```bash
# ─── Local Development ───
docker compose up -d postgres redis    # Start DB + Redis only
node apps/api/dist/main.js             # Start API
cd apps/web && npx next dev            # Start frontend

# ─── Database ───
npx prisma db push --schema=packages/db/prisma/schema.prisma  # Apply schema
npx prisma studio --schema=packages/db/prisma/schema.prisma   # GUI browser
npx prisma migrate dev --schema=packages/db/prisma/schema.prisma  # Create migration

# ─── Testing ───
npx turbo test                         # Run all tests
cd packages/shared && npx vitest run   # Shared package tests only

# ─── Deployment ───
docker compose up --build -d           # Full stack deploy
docker compose logs -f api             # Tail API logs
docker compose restart api             # Restart API

# ─── Troubleshooting ───
curl http://localhost:4000/health      # API health check
docker compose ps                      # Service status
docker compose exec api sh             # Shell into API container
```
