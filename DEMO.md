# Demo Runbook — Lexvion GPT Stack

**Goal:** 3–4 minute live demo that proves production readiness across API, integrations, Slack, OpenAPI, and alerts.

---

## TL;DR (2 minutes)
1) **Health**
   - Vercel: https://lexvion-gpt-stack.vercel.app/api/health → expect `{"ok":true}`
   - Railway: https://lexviongptstack-production.up.railway.app/api/health → expect `{"ok":true}`
2) **Provider checks** (Vercel)
   - Visit each:  
     `/api/check/supabase` • `/api/check/notion` • `/api/check/airtable` • `/api/check/sendgrid` • `/api/check/sentry` • `/api/check/slack` • `/api/check/gsheets`  
     Example: https://lexvion-gpt-stack.vercel.app/api/check/notion → expect `{"configured":true}`
3) **OpenAPI** for GPT Actions
   - https://lexvion-gpt-stack.vercel.app/api/openapi.json → JSON renders
4) **Slack slash command**
   - In `#demo` type:
     ```
     /lex hello world
     ```
     Expect: `👋 Hi @you, you ran /lex with: hello world`
5) **Sentry alerting**
   - Hit a non-existent route:
     https://lexvion-gpt-stack.vercel.app/api/this-does-not-exist → 404 JSON  
     Show Sentry alert or Slack alert message.

---

## Run of Show (read verbatim; ~3–4 min)
**Tabs to prep before recording**
- Vercel health, Railway health, OpenAPI JSON, Slack `#demo` channel (app invited)

**Script**
1) “I’ll show live health, integrations, OpenAPI, a Slack command, and error alerting across two providers.”
2) Vercel health → open  
   URL: `https://lexvion-gpt-stack.vercel.app/api/health`  
   “Vercel prod is healthy.”  
   **Expect:** `{"ok":true}`
3) Railway health → switch tab  
   URL: `https://lexviongptstack-production.up.railway.app/api/health`  
   “Railway prod is healthy.”  
   **Expect:** `{"ok":true}`
4) Provider checks (Vercel)  
   Visit sequentially and pause one beat on each:  
   - `/api/check/slack` → **Expect:** `{"configured":true}`  
   - `/api/check/notion` → **Expect:** `{"configured":true}`  
   - `/api/check/airtable` → **Expect:** `{"configured":true}`  
   - `/api/check/sendgrid` → **Expect:** `{"configured":true}`  
   - `/api/check/sentry` → **Expect:** `{"configured":true}`  
   - `/api/check/supabase` → **Expect:** `{"configured":true}`  
   - `/api/check/gsheets` → **Expect:** `{"configured":true}`  
   “Integrations validate by env var presence. No secrets shown.”
5) OpenAPI spec  
   URL: `https://lexvion-gpt-stack.vercel.app/api/openapi.json`  
   “OpenAPI is public for GPT Actions and codegen.”
6) Slack slash command  
   In `#demo` type and send:
/lex Hello Lexvion
**Expect bot:** `Hi @<your Slack username>, you ran /lex with: Hello Lexvion`  
“Backend sanitizes input and echoes safely.”
7) Monitoring signal  
URL: `https://lexvion-gpt-stack.vercel.app/api/this-does-not-exist` → returns 404 JSON  
“Errors are logged to Sentry with secrets redacted.”
8) Alert visibility  
Show Sentry alert or Slack alert message.  
“Ops sees issues in real time. That closes the loop.”

---

## Preflight Checklist (run before recording)
- **Health:** both prod URLs return `{"ok":true}`
- **Checks:** all `/api/check/*` return `{"configured":true}`
- **Slack:** app invited to `#demo`; `/lex Hello Lexvion` works
- **OpenAPI:** `/api/openapi.json` loads without CORS or auth errors
- **Sentry:** DSN set; alert rule active; channel visible
- **Screen hygiene:** no secret VALUES shown; logs are redacted

---

## Links
- Prod API (Vercel): https://lexvion-gpt-stack.vercel.app/api  
- Prod API (Railway): https://lexviongptstack-production.up.railway.app/api  
- OpenAPI: https://lexvion-gpt-stack.vercel.app/api/openapi.json

---

## Troubleshooting
- A provider check returns `false` → verify the env var **name** on that provider; do not change code.
- Slack not responding → confirm `SLACK_SIGNING_SECRET` and Request URLs:
- Slash: `POST /api/slack/command` (urlencoded)
- Events: `POST /api/slack/events` (HMAC + `url_verification`)
- Interactivity: `POST /api/slack/interactive` (HMAC; urlencoded `payload`)
- No Sentry alert → confirm environment is `production` and alert rule is enabled.

---

## Guardrails
- Never display secret values; mention env var **NAMES** only.
- Keep the demo under 4 minutes. Avoid navigating to consoles during the recording.
