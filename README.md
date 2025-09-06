# Lexvion GPT Stack · Secure AI backend + Slack ops, deployable in minutes

**What it is:** Production-ready Node 20 **pure ESM** service with Slack entry points, hardened REST APIs, OpenAPI for GPT Actions, and turnkey deploys to Vercel and Railway.

<!-- Live status badges -->
[![CI](https://img.shields.io/github/actions/workflow/status/Lexvion-Solutions/Lexvion_GPT_Stack/quality-gate.yml?label=CI)](https://github.com/Lexvion-Solutions/Lexvion_GPT_Stack/actions)
[![Vercel](https://img.shields.io/website?url=https%3A%2F%2Flexvion-gpt-stack.vercel.app%2Fapi%2Fhealth&label=Vercel%20prod)](https://lexvion-gpt-stack.vercel.app/api/health)
[![Railway](https://img.shields.io/website?url=https%3A%2F%2Flexviongptstack-production.up.railway.app%2Fapi%2Fhealth&label=Railway%20prod)](https://lexviongptstack-production.up.railway.app/api/health)

## Live surfaces
- **Health:** [Vercel `/api/health`](https://lexvion-gpt-stack.vercel.app/api/health) · [Railway `/api/health`](https://lexviongptstack-production.up.railway.app/api/health)
- **OpenAPI (for GPT Actions):** [`/api/openapi.json`](https://lexvion-gpt-stack.vercel.app/api/openapi.json)
- **Demo runbook:** [`DEMO.md`](./DEMO.md)
- **Security baseline:** [`HARDENING.md`](./HARDENING.md)

## Key features
- Slack **Slash + Events + Interactivity** with HMAC verification and ±300s replay protection.
- Provider checks: `GET /api/check/{supabase,notion,airtable,sendgrid,sentry,slack,gsheets}` → `{"configured":true}` when env var **names** exist.
- Rate limits via `express-rate-limit`:
  - `/api/slack/*` → **120 req/min/IP**
  - other `/api` → **100 req/min/IP**
  - `app.set("trust proxy", 1)`
- Observability: Sentry DSN configured; alert **“Prod error spike”** notifies Slack + email.
- CI/CD: PR quality gate (lint/tests/smoke/OpenAPI). Auto-deploy to Vercel & Railway with required checks on `main`.

## Quick links
- Health: **Vercel** → https://lexvion-gpt-stack.vercel.app/api/health · **Railway** → https://lexviongptstack-production.up.railway.app/api/health  
- OpenAPI: https://lexvion-gpt-stack.vercel.app/api/openapi.json  
- Runbook: [DEMO.md](./DEMO.md) · Hardening: [HARDENING.md](./HARDENING.md)

## One-line Slack test
In Slack channel `#demo`:
/lex Hello Lexvion

markdown
Copy code
Expected: `Hi @<your Slack username>, you ran /lex with: Hello Lexvion`

---

# Lexvion GPT Stack – Express API

Minimal Node.js + Express API to integrate Slack with Supabase, Notion, Airtable, SendGrid, Google Sheets, and Sentry. Pure ESM. No frontend.

## Project structure
- `index.js` (entrypoint)
- `routes.js` (HTTP + Slack routes)
- `services/` (provider integrations)
- `Dockerfile` (production)
- `package.json` → `"start": "npm start"`

## Quick start (local)
1. `cp .env.template .env` and set values **locally**. Use names only in commits.
2. `npm install`
3. `npm start` (defaults to `PORT=3000`)
4. Test:
   ```bash
   curl -s http://localhost:3000/api/health        # => {"ok":true}
Demo cURL cheatsheet (prod)
bash
Copy code
# Health
curl -s https://lexvion-gpt-stack.vercel.app/api/health | jq .
curl -s https://lexviongptstack-production.up.railway.app/api/health | jq .

# Provider checks (Vercel)
for svc in supabase notion airtable sendgrid sentry slack gsheets; do
  echo "check/$svc:" && curl -s https://lexvion-gpt-stack.vercel.app/api/check/$svc | jq .
done

# OpenAPI spec summary
curl -s https://lexvion-gpt-stack.vercel.app/api/openapi.json | jq '.info, (.paths | keys | length)'

# Generate a test 404 to exercise Sentry
curl -s -o /dev/null -w "%{http_code}\n" https://lexvion-gpt-stack.vercel.app/api/this-does-not-exist
Expected: both health → {"ok":true}; all checks → {"configured":true}; OpenAPI prints info and path count; last line shows 404.
Note: jq is optional; remove pipes if not installed.

Deployment
Vercel (production)
Create a Vercel project from this repo.

Set Environment Variables (names only):
PORT, SUPABASE_URL, SUPABASE_ANON_KEY, SENTRY_DSN, SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN, NOTION_TOKEN, AIRTABLE_API_KEY, AIRTABLE_BASE_ID, SENDGRID_API_KEY, GSHEETS_CLIENT_EMAIL, GSHEETS_PRIVATE_KEY

GSHEETS_PRIVATE_KEY must be saved with real newlines.

Deploy. Health: https://<app>.vercel.app/api/health.

Railway (production)
Create a Railway service from this repo.

Set the same env var names as above.

Deploy. Health: https://<app>.up.railway.app/api/health.

Slack app configuration
Slash /lex → Request URL: POST https://<host>/api/slack/command (URL-encoded).

Events → POST https://<host>/api/slack/events (HMAC + url_verification).

Interactivity → POST https://<host>/api/slack/interactive (HMAC; URL-encoded payload).

HMAC signature window ±300s. Invite the app to the target channel.

Routes
GET /api/health → {"ok":true}

GET /api/check/{supabase|notion|airtable|sendgrid|sentry|slack|gsheets} → {"configured":true} when related env var names exist.

GET /api/openapi.json → OpenAPI spec (used by GPT Actions)

POST /api/slack/command → echoes sanitized input; length-clamped

POST /api/slack/events → verifies HMAC; supports Slack URL verification

POST /api/slack/interactive → verifies HMAC

Security and reliability
Rate limiting: /api/slack/* 120 rpm/IP; other /api 100 rpm/IP.

Headers: security headers enabled; request logging with secret redaction.

Trust proxy: app.set("trust proxy", 1) for accurate IPs behind Vercel/Railway.

Observability
Sentry DSN configured. Alert “Prod error spike”:

Triggers on new issue and on >50 events in 5 minutes.

Notifies Slack and email.

CI/CD
.github/workflows/quality-gate.yml → lint, tests, smoke, OpenAPI on PR.

.github/workflows/vercel-deploy.yml → deploy main to Vercel.

.github/workflows/railway-deploy.yml → deploy main to Railway.

Branch protection on main: PR required, status checks required, up-to-date required, block force pushes/deletions, ≥1 reviewer.

Required checks: CI, Code scanning results (CodeQL), Vercel Deployment, Railway App.

Troubleshooting
A provider check returns false → fix the env var name on that provider.

Slack not responding → verify SLACK_SIGNING_SECRET and Request URLs match the /api/slack/ paths above.

Sentry alert missing → ensure DSN is set and environment is production.

GSHEETS_PRIVATE_KEY errors → store with real newlines.

License
MIT
