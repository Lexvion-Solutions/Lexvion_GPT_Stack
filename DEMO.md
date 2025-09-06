# Demo Runbook — Lexvion GPT Stack

## TL;DR (2 minutes)
1. Open **Health**:  
   - Vercel: https://lexvion-gpt-stack.vercel.app/api/health  
   - Railway: https://lexviongptstack-production.up.railway.app/api/health
2. Open **Provider checks** (Vercel):  
   /api/check/supabase • /notion • /airtable • /sendgrid • /sentry • /slack • /gsheets  
   Example: https://lexvion-gpt-stack.vercel.app/api/check/notion
3. Show **OpenAPI** for GPT Actions:  
   https://lexvion-gpt-stack.vercel.app/api/openapi.json
4. In Slack, run:  

/lex hello world

Expected: `👋 Hi @you, you ran /lex with: hello world`
5. Show **Sentry alerting**: hit a non-existent route to generate an error, then show the Slack alert.

---

## Detailed Flow

### 1) CI/CD and Protections
- GitHub → Pull Request → checks required: CI, CodeQL, Vercel, Railway.
- Ruleset blocks force-push and greenless merges.

### 2) APIs live
- Health:  
- Vercel → `{ "ok": true }`  
- Railway → `{ "ok": true }`
- Integrations: each `/api/check/*` → `{ "configured": true }`.

### 3) Slack integration
- Slash: `/lex <text>` → sanitized echo.
- Events: URL verified (`/api/slack/events`).
- Interactivity: ACK verified (`/api/slack/interactive`).

### 4) Observability
- Sentry DSN set. Alert: **Prod error spike** (Slack + Email).

---

## Links
- Prod API (Vercel): https://lexvion-gpt-stack.vercel.app/api
- Prod API (Railway): https://lexviongptstack-production.up.railway.app/api
- OpenAPI: https://lexvion-gpt-stack.vercel.app/api/openapi.json

---

## Troubleshooting cheats
- A provider check is `false` → verify that env var name exists on that provider.
- Slack not responding → verify `SLACK_SIGNING_SECRET` and URL paths.
- Sentry alert missing → confirm environment filter = `production`.

