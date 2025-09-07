**Expect bot:** `Hi @<your Slack username>, you ran /lex with: Hello Lexvion`  
“Backend sanitizes and echoes safely.”

7) **Monitoring signal (real error)**  
URL: `https://lexvion-gpt-stack.vercel.app/api/test/sentry` → returns **500**  
“Intentional error captured by Sentry with redaction.”

8) **Alert visibility**  
Show the new event in Sentry or the Slack alert.  
“Ops sees issues in real time.”

---

## Preflight Checklist

- **Health:** both prod URLs return `{"ok":true}`
- **Checks:** all `/api/check/*` → `{"configured":true}`
- **Docs:** `/api/docs` loads and lists operations
- **Slack:** app invited to `#demo`; `/lex Hello Lexvion` works
- **Sentry:** DSN set; alert rule active; `/api/test/sentry` creates a new event
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
- No Sentry alert → ensure environment is `production` and alert rule is enabled.

---

## Guardrails

- Never display secret VALUES. Refer to env var **NAMES** only.
- Keep the demo under 4 minutes. Avoid navigating to consoles during the recording.
/lex Hello Lexvion
**Expect bot:** `Hi @<your Slack username>, you ran /lex with: Hello Lexvion`  
“Backend sanitizes and echoes safely.”

7) **Monitoring signal (real error)**  
URL: `https://lexvion-gpt-stack.vercel.app/api/test/sentry` → returns **500**  
“Intentional error captured by Sentry with redaction.”

8) **Alert visibility**  
Show the new event in Sentry or the Slack alert.  
“Ops sees issues in real time.”

---

## Preflight Checklist

- **Health:** both prod URLs return `{"ok":true}`
- **Checks:** all `/api/check/*` → `{"configured":true}`
- **Docs:** `/api/docs` loads and lists operations
- **Slack:** app invited to `#demo`; `/lex Hello Lexvion` works
- **Sentry:** DSN set; alert rule active; `/api/test/sentry` creates a new event
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
- No Sentry alert → ensure environment is `production` and alert rule is enabled.

---

## Guardrails

- Never display secret VALUES. Refer to env var **NAMES** only.
- Keep the demo under 4 minutes. Avoid navigating to consoles during the recording.
