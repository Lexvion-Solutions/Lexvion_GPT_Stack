# Demo Runbook — Lexvion GPT Stack

**Goal:** 3–4 minute live demo proving production readiness across API, integrations, Slack, API docs, and error handling.

---

## TL;DR (2 minutes)

1) **Health**
   - Vercel → https://lexvion-gpt-stack.vercel.app/api/health → expect `{"ok":true}`
   - Railway → https://lexviongptstack-production.up.railway.app/api/health → expect `{"ok":true}`

2) **Provider checks** (Vercel)
   - Visit each:  
     `/api/check/supabase` • `/api/check/notion` • `/api/check/airtable` • `/api/check/sendgrid` • `/api/check/sentry` • `/api/check/slack` • `/api/check/gsheets`  
     Example: https://lexvion-gpt-stack.vercel.app/api/check/notion → expect `{"configured":true}`

3) **API Docs**
   - https://lexvion-gpt-stack.vercel.app/api/docs → page renders with **GET — Try** buttons

4) **Slack slash command**
   - In `#demo` send:
     ```
     /lex Hello Lexvion
     ```
     Expect: `Hi @<your Slack username>, you ran /lex with: Hello Lexvion`

5) **Error visibility**
   - Trigger controlled 500: https://lexvion-gpt-stack.vercel.app/api/test/sentry → HTTP **500** JSON  
   - If alerts are enabled, show Sentry/Slack alert; otherwise narrate where alerts go.

---

## Run of Show (read verbatim; ~3–4 min)

**Prep tabs:** Vercel health, Railway health, **API Docs**, Slack `#demo` (app invited)

1) “Lexvion GPT Stack — secure Slack + API backend. I’ll show health, integrations, docs, Slack command, and error handling across Vercel and Railway.”

2) **Vercel health**  
   URL: `https://lexvion-gpt-stack.vercel.app/api/health` → **Expect** `{"ok":true}`

3) **Railway health**  
   URL: `https://lexviongptstack-production.up.railway.app/api/health` → **Expect** `{"ok":true}`

4) **Provider checks (Vercel)**  
   Visit and pause briefly on each:
   - `/api/check/slack` → `{"configured":true}`
   - `/api/check/notion` → `{"configured":true}`
   - `/api/check/airtable` → `{"configured":true}`
   - `/api/check/sendgrid` → `{"configured":true}`
   - `/api/check/sentry` → `{"configured":true}`
   - `/api/check/supabase` → `{"configured":true}`
   - `/api/check/gsheets` → `{"configured":true}`
   “These validate env var **names** only. No secrets shown.”

5) **API docs**  
   URL: `https://lexvion-gpt-stack.vercel.app/api/docs`  
   “Docs are live. Click **GET — Try** on `/api/health` to show a 200 response.”

6) **Slack slash command**  
   In `#demo` send:
/lex Hello Lexvion
**Expect bot:** `Hi @<your Slack username>, you ran /lex with: Hello Lexvion`  
“Backend sanitizes and echoes safely.”

7) **Monitoring signal (controlled 500)**  
URL: `https://lexvion-gpt-stack.vercel.app/api/test/sentry` → returns **500** with JSON  
“Intentional server error. This is what downstream alerting hooks into.”

8) **Alert visibility (if enabled)**  
If alerts are active, show the new event in Sentry or the Slack alert.  
Otherwise say: “Alert destinations are configurable (Sentry, Slack, email) and disabled in this environment.”

---

## Preflight Checklist

- **Health:** both prod URLs return `{"ok":true}`
- **Checks:** all `/api/check/*` → `{"configured":true}`
- **Docs:** `/api/docs` loads and lists operations; **GET — Try** works on `/api/health`
- **Slack:** app invited to `#demo`; `/lex Hello Lexvion` works
- **Alerts (optional):** if enabled, `/api/test/sentry` creates a fresh event in your alert destination
- **Screen hygiene:** no secret VALUES visible; logs redacted

---

## Links

- Prod API (Vercel): https://lexvion-gpt-stack.vercel.app/api  
- Prod API (Railway): https://lexviongptstack-production.up.railway.app/api  
- API Docs: https://lexvion-gpt-stack.vercel.app/api/docs  
- OpenAPI JSON: https://lexvion-gpt-stack.vercel.app/api/openapi.json

---

## Troubleshooting

- A provider check returns `false` → fix the **env var name** on that provider.
- Slack not responding → verify Request URLs:
- Slash: `POST /api/slack/command` (urlencoded)
- Events: `POST /api/slack/events` (HMAC + `url_verification`)
- Interactivity: `POST /api/slack/interactive` (HMAC; urlencoded `payload`)
- Docs page blank → hard refresh or add `?v=1` to `/api/docs`.
- No alert → alerts disabled; the 500 JSON is sufficient for the demo.

---

## Guardrails

- Never display secret VALUES. Refer to env var **NAMES** only.
- Keep the demo under 4 minutes. Avoid navigating to consoles during the recording.
