---
name: Demo Preflight
about: Run before any live demo of Lexvion GPT Stack.
title: ''
labels: ''
assignees: Bigmannot23

---

---
name: "Demo Preflight"
about: "Run before any live demo of Lexvion GPT Stack"
title: "Demo Preflight — <YYYY-MM-DD>"
labels: ["demo","preflight"]
assignees: []
---

## Demo details
- Target audience: <!-- investors / internal / partner -->
- Presenter: <!-- @handle -->
- Date & time (TZ): <!-- 2025-09-06 14:00 America/Chicago -->
- Slack channel for alerts: <!-- #demo -->

## Health
- [ ] Vercel `/api/health` → `{"ok":true}`
- [ ] Railway `/api/health` → `{"ok":true}`

## Provider checks (Vercel)
- [ ] `/api/check/slack` → `{"configured":true}`
- [ ] `/api/check/notion` → `{"configured":true}`
- [ ] `/api/check/airtable` → `{"configured":true}`
- [ ] `/api/check/sendgrid` → `{"configured":true}`
- [ ] `/api/check/sentry` → `{"configured":true}`
- [ ] `/api/check/supabase` → `{"configured":true}`
- [ ] `/api/check/gsheets` → `{"configured":true}`

## Slack
- [ ] App invited to `#demo`
- [ ] Slash works: `/lex Hello Lexvion` → bot echoes sanitized text
- [ ] Events URL verified (`/api/slack/events`)
- [ ] Interactivity ACK verified (`/api/slack/interactive`)

## OpenAPI
- [ ] `/api/openapi.json` renders without CORS/auth errors

## Observability
- [ ] Sentry DSN present (name only)
- [ ] “Prod error spike” rule enabled
- [ ] Test 404 triggers alert visible in Slack or Sentry UI

## Screen hygiene
- [ ] No secret VALUES visible in any window
- [ ] Logs show redaction

## Go / No-Go
- [ ] All checks green → **GO**
- [ ] Any check fails → **NO-GO**. Fix env var **names** on provider and re-run.
