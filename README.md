<h1 align="center">Lexvion GPT Stack</h1>
<p align="center"><b>Secure AI backend + Slack ops, deployable in minutes</b></p>
<p align="center">Node.js 20 • Pure ESM • Slack entry points • Hardened REST • OpenAPI for GPT Actions • Deploys to <b>Vercel</b> and <b>Railway</b></p>

<p align="center">
  <a href="https://github.com/Lexvion-Solutions/Lexvion_GPT_Stack/actions">
    <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/Lexvion-Solutions/Lexvion_GPT_Stack/quality-gate.yml?label=CI">
  </a>
  <a href="https://lexvion-gpt-stack.vercel.app/api/health">
    <img alt="Vercel" src="https://img.shields.io/website?url=https%3A%2F%2Flexvion-gpt-stack.vercel.app%2Fapi%2Fhealth&label=Vercel%20prod">
  </a>
  <a href="https://lexviongptstack-production.up.railway.app/api/health">
    <img alt="Railway" src="https://img.shields.io/website?url=https%3A%2F%2Flexviongptstack-production.up.railway.app%2Fapi%2Fhealth&label=Railway%20prod">
  </a>
</p>

<p align="center">
  <a href="#live-surfaces">Live</a> ·
  <a href="#features">Features</a> ·
  <a href="#quick-start-local">Quick Start</a> ·
  <a href="#deployment">Deploy</a> ·
  <a href="#slack-app-configuration">Slack</a> ·
  <a href="#routes">Routes</a> ·
  <a href="#security--reliability">Security</a> ·
  <a href="#cicd">CI/CD</a> ·
  <a href="#troubleshooting">Troubleshoot</a>
</p>

---

## Table of Contents
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
- [Environment Variables](#environment-variables)
- [Security & Reliability](#security--reliability)
- [Observability](#observability)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)
- [Demo cURL Cheatsheet (Prod)](#demo-curl-cheatsheet-prod)
- [License](#license)

---

## Live Surfaces
- **Health:** <a href="https://lexvion-gpt-stack.vercel.app/api/health">Vercel</a> · <a href="https://lexviongptstack-production.up.railway.app/api/health">Railway</a>  
- **OpenAPI (for GPT Actions):** <a href="https://lexvion-gpt-stack.vercel.app/api/openapi.json"><code>/api/openapi.json</code></a>  
- **Demo runbook:** <a href="./DEMO.md">DEMO.md</a> · **Security baseline:** <a href="./HARDENING.md">HARDENING.md</a>

---

## Features
- 🔌 **Slack**: Slash commands, Events, Interactivity
  - HMAC verification and ±300s replay protection
- ✅ **Provider checks**:
  - `GET /api/check/{supabase|notion|airtable|sendgrid|sentry|slack|gsheets}` → `{"configured":true}` when env names exist
- ⏱️ **Rate limits**:
  - `/api/slack/*` → 120 req/min/IP
  - other `/api/*` → 100 req/min/IP
  - `app.set("trust proxy", 1)`
- 🔭 **Observability**:
  - Sentry DSN configured · Alert “Prod error spike” → Slack + email
- 🔁 **CI/CD**:
  - PR quality gate (lint, tests, smoke, OpenAPI)
  - Auto-deploy to Vercel & Railway
  - Protected `main` with required checks

---

## Quick Start (Local)
```bash
cp .env.template .env   # set env values locally
npm install
npm start               # defaults to PORT=3000
Health check:

bash
Copy code
curl -s http://localhost:3000/api/health  # => {"ok":true}
Slack One-Liner Test
In Slack channel #demo:

bash
Copy code
/lex Hello Lexvion
Expected:

bash
Copy code
Hi @<your Slack username>, you ran /lex with: Hello Lexvion
Project Structure
bash
Copy code
index.js        # Entrypoint
routes.js       # HTTP + Slack routes
services/       # Provider integrations
Dockerfile      # Production image
package.json    # "start": "npm start"
Deployment
<details> <summary><b>Vercel</b></summary>
Create a Vercel project from this repo.

Set environment variables:

Copy code
PORT, SUPABASE_URL, SUPABASE_ANON_KEY, SENTRY_DSN,
SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN, NOTION_TOKEN,
AIRTABLE_API_KEY, AIRTABLE_BASE_ID, SENDGRID_API_KEY,
GSHEETS_CLIENT_EMAIL, GSHEETS_PRIVATE_KEY
GSHEETS_PRIVATE_KEY must include real newlines.

Deploy → Health: https://<app>.vercel.app/api/health

</details> <details> <summary><b>Railway</b></summary>
Create a Railway service from this repo.

Set the same environment variables as above.

Deploy → Health: https://<app>.up.railway.app/api/health

</details>
Slack App Configuration
Surface	Method	URL	Notes
Slash /lex	POST	https://<host>/api/slack/command	URL-encoded
Events	POST	https://<host>/api/slack/events	HMAC + url_verification
Interactivity	POST	https://<host>/api/slack/interactive	HMAC; URL-encoded payload

Requirements:

HMAC signature window ±300s

Invite the app to the target channel

Routes
Method	Path	Description
GET	/api/health	{"ok":true}
GET	`/api/check/{supabase	notion
GET	/api/openapi.json	OpenAPI spec (for GPT Actions)
POST	/api/slack/command	Echoes sanitized input; length-clamped
POST	/api/slack/events	Verifies HMAC; Slack URL verification
POST	/api/slack/interactive	Verifies HMAC

Environment Variables
Name	Purpose
PORT	HTTP port (Vercel/Railway can override)
SUPABASE_URL, SUPABASE_ANON_KEY	Supabase integration
SENTRY_DSN	Sentry project DSN
SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN	Slack auth + HMAC
NOTION_TOKEN	Notion API token
AIRTABLE_API_KEY, AIRTABLE_BASE_ID	Airtable integration
SENDGRID_API_KEY	SendGrid integration
GSHEETS_CLIENT_EMAIL, GSHEETS_PRIVATE_KEY	Google Sheets service account (PRIVATE_KEY uses real newlines)

Security & Reliability
Rate limiting

/api/slack/* → 120 rpm/IP

Other /api/* → 100 rpm/IP

Headers: Security headers enabled

Logging: Request logging with secret redaction

Proxy: app.set("trust proxy", 1) for accurate IPs on Vercel/Railway

Observability
Sentry DSN configured

Alert “Prod error spike”

Triggers on new issue or >50 events in 5 minutes

Notifies Slack and email

CI/CD
PR quality gate: lint, tests, smoke, OpenAPI

Auto-deploy to Vercel & Railway

Branch protection on main

PR required, up-to-date required

Required checks: CI, CodeQL, Vercel, Railway

Block force pushes/deletions, ≥1 reviewer

Troubleshooting
Symptom	Action
Provider check returns false	Fix the env var name for that provider
Slack not responding	Verify SLACK_SIGNING_SECRET and Request URLs
Sentry alert missing	Ensure DSN set and environment is production
GSHEETS_PRIVATE_KEY errors	Store with real newlines

Demo cURL Cheatsheet (Prod)
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
Expected:

Health → {"ok":true}

Checks → {"configured":true}

OpenAPI prints info + path count

Last command → 404

License
MIT
