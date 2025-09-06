# Lexvion GPT Stack — Hardening Baseline (STRICT)

> Source of truth for security, CI/CD, environment, Slack, and merge controls.  
> All items in this doc are **required**.

---

## CI/CD

- **Workflows**
  - GitHub Actions: quality gate (lint/tests/smoke/OpenAPI) on PRs.
  - Provider deploys: Vercel and Railway on `main`.
- **Required status checks on `main`**
  - ✅ CI (GitHub Actions)
  - ✅ Code scanning results / CodeQL
  - ✅ Vercel — Deployment (exact name as shown in PR checks)
  - ✅ Railway App (exact name as shown in PR checks)
- **Branch protection (ruleset `protect-main`)**
  - Require a pull request before merging
  - Require status checks to pass → the four checks above
  - Require branches to be up to date before merging
  - Block force pushes and block deletions
  - Minimum reviewers: **1**

---

## Environment & Providers (all must be set, non-empty)

PORT
SUPABASE_URL
SUPABASE_ANON_KEY
SENTRY_DSN
SLACK_SIGNING_SECRET
SLACK_BOT_TOKEN
NOTION_TOKEN
AIRTABLE_API_KEY
AIRTABLE_BASE_ID
SENDGRID_API_KEY
GSHEETS_CLIENT_EMAIL
GSHEETS_PRIVATE_KEY


- `/api/health` and `/api/check/*` must return healthy/configured on **both Vercel and Railway**.

---

## Security

- **Slack auth:** HMAC signature verification with ±300s replay window on:
  - `POST /api/slack/events`
  - `POST /api/slack/interactive`
- **Rate limiting:** Enabled for `/api` and `/api/slack/*`.
  - Guidance: 60 req/min per IP; separate bucket for Slack ingress; tolerate Slack retries.
- **Body limits:** JSON ≤ **256 KB**; urlencoded ≤ **64 KB**.
- **Input handling:** Do not reflect untrusted strings without normalization.
  - Slack `/api/slack/command`: trim, cap length, and escape before echoing; prefer Block Kit fields over raw text.
- **Headers & logging:** Security headers enabled; redact tokens/PII in logs.
- **CodeQL:** Enabled and required; failure threshold = **High or higher**; alerts triaged within 24h.

---

## Slack

- Slash command `/lex` → `POST /api/slack/command` (urlencoded).
- Events → `POST /api/slack/events` (supports `url_verification`).
- Interactivity → `POST /api/slack/interactive` (urlencoded `payload` JSON).
- Secrets: `SLACK_SIGNING_SECRET`, `SLACK_BOT_TOKEN` (never hard-coded).

---

## OpenAPI

- Served at `GET /api/openapi.json`, version **3.1.0**.
- Must include paths: `/api/health`, `/api/check/*`, Slack endpoints.
- Server URL points to **production** base.
- CI runs the OpenAPI validation script.

---

## Monitoring

- Sentry enabled; alert on error spikes.
- Vercel and Railway deploy alerts enabled and routed.

---

## Verify (must pass before merge)

- [ ] All required checks are green on PR: CI, CodeQL, Vercel, Railway
- [ ] Smoke tests pass locally or against preview
- [ ] `/api/check/*` show `configured: true` for enabled providers
- [ ] Slack `url_verification` challenge succeeds when wiring a workspace

---

## Change Control

- Update this file in any PR that changes CI/CD, environment, or security behavior.
- Never commit secret values. Rotate on suspicion.
