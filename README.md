````markdown
# Lexvion GPT Stack  
**Secure AI backend + Slack ops, deployable in minutes**

Production-ready Node.js 20 **pure ESM** service with Slack entry points, hardened REST APIs, OpenAPI for GPT Actions, and turnkey deploys to **Vercel** and **Railway**.  

---

## Table of Contents
- [Status](#status)
- [Live Surfaces](#live-surfaces)
- [Features](#features)
- [Quick Start (Local)](#quick-start-local)
- [Slack One-Liner Test](#slack-one-liner-test)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
  - [Vercel](#vercel)
  - [Railway](#railway)
- [Slack App Configuration](#slack-app-configuration)
- [Routes](#routes)
- [Security & Reliability](#security--reliability)
- [Observability](#observability)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)
- [Demo cURL Cheatsheet (Prod)](#demo-curl-cheatsheet-prod)
- [License](#license)

---

## Status
[![CI](https://img.shields.io/github/actions/workflow/status/Lexvion-Solutions/Lexvion_GPT_Stack/quality-gate.yml?label=CI)](https://github.com/Lexvion-Solutions/Lexvion_GPT_Stack/actions)  
[![Vercel](https://img.shields.io/website?url=https%3A%2F%2Flexvion-gpt-stack.vercel.app%2Fapi%2Fhealth&label=Vercel%20prod)](https://lexvion-gpt-stack.vercel.app/api/health)  
[![Railway](https://img.shields.io/website?url=https%3A%2F%2Flexviongptstack-production.up.railway.app%2Fapi%2Fhealth&label=Railway%20prod)](https://lexviongptstack-production.up.railway.app/api/health)  

---

## Live Surfaces
- **Health:** [Vercel](https://lexvion-gpt-stack.vercel.app/api/health) · [Railway](https://lexviongptstack-production.up.railway.app/api/health)  
- **OpenAPI (for GPT Actions):** [`/api/openapi.json`](https://lexvion-gpt-stack.vercel.app/api/openapi.json)  
- **Demo runbook:** [`DEMO.md`](./DEMO.md)  
- **Security baseline:** [`HARDENING.md`](./HARDENING.md)  

---

## Features
- Slack integration (**Slash commands, Events, Interactivity**) with:
  - HMAC verification
  - ±300s replay protection
- Provider checks:  
  `GET /api/check/{supabase|notion|airtable|sendgrid|sentry|slack|gsheets}` → `{"configured":true}` if env vars exist
- Rate limiting:
  - `/api/slack/*` → 120 req/min/IP
  - other `/api/*` → 100 req/min/IP  
  (`app.set("trust proxy", 1)`)
- Observability:
  - **Sentry DSN** configured
  - Alert **“Prod error spike”** → Slack + email
- CI/CD:
  - PR quality gate (lint, tests, smoke, OpenAPI)
  - Auto-deploy to Vercel & Railway
  - Protected `main` branch (PRs, checks, reviewers)  

---

## Quick Start (Local)
```bash
cp .env.template .env   # set env values locally
npm install
npm start               # defaults to PORT=3000
````

Health check:

```bash
curl -s http://localhost:3000/api/health  # => {"ok":true}
```

---

## Slack One-Liner Test

In Slack channel `#demo`:

```
/lex Hello Lexvion
```

Expected:

```
Hi @<your Slack username>, you ran /lex with: Hello Lexvion
```

---

## Project Structure

```
index.js        # Entrypoint
routes.js       # HTTP + Slack routes
services/       # Provider integrations
Dockerfile      # Production image
package.json    # "start": "npm start"
```

---

## Deployment

### Vercel

1. Create a Vercel project from this repo.
2. Set environment variables:

   ```
   PORT, SUPABASE_URL, SUPABASE_ANON_KEY, SENTRY_DSN,
   SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN, NOTION_TOKEN,
   AIRTABLE_API_KEY, AIRTABLE_BASE_ID, SENDGRID_API_KEY,
   GSHEETS_CLIENT_EMAIL, GSHEETS_PRIVATE_KEY
   ```

   * `GSHEETS_PRIVATE_KEY` must include real newlines.
3. Deploy → Health check: `https://<app>.vercel.app/api/health`

### Railway

1. Create a Railway service from this repo.
2. Set the same environment variables as above.
3. Deploy → Health check: `https://<app>.up.railway.app/api/health`

---

## Slack App Configuration

* Slash `/lex` → `POST https://<host>/api/slack/command`
* Events → `POST https://<host>/api/slack/events`
* Interactivity → `POST https://<host>/api/slack/interactive`
* Requirements:

  * HMAC verification
  * ±300s signature window
  * Invite app to target channel

---

## Routes

* `GET /api/health` → `{"ok":true}`
* `GET /api/check/{provider}` → `{"configured":true}`
* `GET /api/openapi.json` → OpenAPI spec
* `POST /api/slack/command` → echoes sanitized input
* `POST /api/slack/events` → verifies HMAC + URL verification
* `POST /api/slack/interactive` → verifies HMAC

---

## Security & Reliability

* Rate limiting: Slack 120 rpm/IP · other APIs 100 rpm/IP
* Security headers enabled
* Request logging with secret redaction
* `app.set("trust proxy", 1)` for Vercel/Railway IPs

---

## Observability

* **Sentry DSN** configured
* Alert **“Prod error spike”**:

  * Triggers on new issue or >50 events in 5 min
  * Notifies Slack + email

---

## CI/CD

* `.github/workflows/quality-gate.yml` → lint, tests, smoke, OpenAPI on PR
* `.github/workflows/vercel-deploy.yml` → deploy `main` → Vercel
* `.github/workflows/railway-deploy.yml` → deploy `main` → Railway
* Branch protection on `main`: PR required, status checks required, no force pushes, ≥1 reviewer
* Required checks: CI, CodeQL, Vercel, Railway

---

## Troubleshooting

* Provider check returns `false` → fix env var name
* Slack not responding → verify `SLACK_SIGNING_SECRET` + request URLs
* Missing Sentry alerts → ensure DSN + prod environment
* GSheets key issues → ensure newlines preserved

---

## Demo cURL Cheatsheet (Prod)

```bash
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
```

Expected:

* Health → `{"ok":true}`
* Checks → `{"configured":true}`
* OpenAPI prints info + path count
* Last command → `404`

---

## License

MIT

```
```
