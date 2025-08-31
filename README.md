# Lexvion GPT Stack – Express API

This repository provides a minimal Node.js + Express API layer to integrate
with Supabase, Notion, Airtable, SendGrid and Slack.  It is designed
for server‑side use without any frontend and deploys easily to
platforms such as Vercel and Railway.

## Quick start

1. **Prepare your environment**: copy `.env.template` to `.env` and
   populate the variables with your own keys and URLs.  **Never
   commit your real secrets.**
2. **Install dependencies**: run `npm install`.
3. **Start the server**: run `npm start`.  The server listens on
   `process.env.PORT` (default `3000`).

### Testing locally

- **Root route** – `GET /` should return `{ "ok": true }`.
- **Health route** – `GET /api/health` should return `{ "ok": true }`.

You can test these endpoints with `curl`:

```sh
curl http://localhost:3000/           # => {"ok":true}
curl http://localhost:3000/api/health # => {"ok":true}
```

## Deployment

### Vercel

1. Create a new Vercel project from this repository.
2. In the Vercel dashboard, define the environment variables listed
   in `.env.template`.  Only names are committed; values must be
   provided securely.
3. When Vercel builds your project it will run `npm install` and
   `npm start`.  The health route is available at
   `https://<your-app>.vercel.app/api/health`.

### Railway

1. Create a new Railway project from this repository.
2. Railway will detect a Node.js app automatically.  Define the same
   environment variables in your project’s settings.
3. A `Procfile` is included with `web: npm start` so Railway knows
   how to run the service.  If Railway fails to detect the project
   correctly, a `Dockerfile` is also provided.  The Dockerfile
   exposes `$PORT` and starts the server via `npm start`.  You can
   enable Docker builds in Railway’s settings if needed.

## Slack setup

Configure your Slack app to send requests to your Vercel deployment:

- **Events** URL – `https://<your-vercel-app>.vercel.app/api/slack/events`
- **Interactive components** URL – `https://<your-vercel-app>.vercel.app/api/slack/interactive`

These endpoints are implemented in `routes.js` and use the raw
request body to verify Slack signatures.  The server always responds
`200 OK` to `app_mention` events.  Make sure `SLACK_SIGNING_SECRET`
is defined in your environment; only the name is committed in
`.env.template`.

## Smoke test endpoints

For quick diagnostics of your configuration, the API exposes several
check endpoints:

- `GET /api/check/sentry` – if `SENTRY_DSN` is defined this route triggers
  a test exception and returns `{ "configured": true }`; if not it
  returns `{ "configured": false }` without sending anything to Sentry.
- `GET /api/check/notion` – returns `{ "configured": true }` when
  `NOTION_API_KEY` is set.
- `GET /api/check/airtable` – returns `{ "configured": true }` when
  `AIRTABLE_API_KEY` is set.
- `GET /api/check/supabase` – returns `{ "configured": true }` when
  both `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` are set.

These endpoints perform no external API calls; they solely verify the
presence of the associated environment variables.