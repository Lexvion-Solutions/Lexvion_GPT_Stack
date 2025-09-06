import express from "express";

const router = express.Router();

/**
 * Slack Events
 * HMAC is already verified in index.js. Body arrives as a UTF-8 string.
 */
router.post("/slack/events", async (req, res) => {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    // URL verification (challenge)
    if (body?.type === "url_verification" && body?.challenge) {
      return res.status(200).send(body.challenge);
    }

    // Handle event callbacks (body.event)
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("slack/events parse error", err);
    return res.status(400).json({ error: "Bad Slack events payload" });
  }
});

/**
 * Slack Interactivity
 * Body is a UTF-8 string of x-www-form-urlencoded. Extract 'payload' then JSON.parse.
 */
router.post("/slack/interactive", async (req, res) => {
  try {
    let payloadJson = null;

    if (typeof req.body === "string") {
      const params = new URLSearchParams(req.body);
      const p = params.get("payload");
      if (!p) return res.status(400).json({ error: "Missing payload" });
      payloadJson = JSON.parse(p);
    } else if (req.body?.payload) {
      payloadJson = JSON.parse(req.body.payload);
    } else {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // Handle actions/views/modals using payloadJson
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("slack/interactive parse error", err);
    return res.status(400).json({ error: "Bad Slack interactive payload" });
  }
});

/**
 * Slack Slash Command (/lex)
 * Uses urlencoded parser. Optional to add signature verification later.
 */
router.post("/slack/command", express.urlencoded({ extended: true }), (req, res) => {
  const { text, user_name } = req.body || {};
  res.json({
    response_type: "in_channel",
    text: `👋 Hi @${user_name || "user"}, you ran /lex with: ${text || "(no text)"}`,
  });
});

/**
 * Integration checks
 */
router.get("/check/supabase", (_req, res) => {
  const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  res.json({ configured });
});

router.get("/check/notion", (_req, res) => {
  const configured = Boolean(process.env.NOTION_TOKEN);
  res.json({ configured });
});

router.get("/check/airtable", (_req, res) => {
  const configured = Boolean(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID);
  res.json({ configured });
});

router.get("/check/sendgrid", (_req, res) => {
  const configured = Boolean(process.env.SENDGRID_API_KEY);
  res.json({ configured });
});

router.get("/check/sentry", (_req, res) => {
  const configured = Boolean(process.env.SENTRY_DSN);
  res.json({ configured });
});

router.get("/check/slack", (_req, res) => {
  const configured = Boolean(process.env.SLACK_SIGNING_SECRET && process.env.SLACK_BOT_TOKEN);
  res.json({ configured });
});

router.get("/check/gsheets", (_req, res) => {
  const configured = Boolean(process.env.GSHEETS_CLIENT_EMAIL && process.env.GSHEETS_PRIVATE_KEY);
  res.json({ configured });
});

/**
 * OpenAPI schema for ChatGPT Actions
 * Server URL is dynamic via OPENAPI_BASE_URL or VERCEL_URL.
 */
const openapi = {
  openapi: "3.1.0",
  info: { title: "Lexvion GPT Stack API", version: "1.0.0" },
  servers: [
    {
      url:
        process.env.OPENAPI_BASE_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}/api`
          : "https://lexvion-gpt-stack.vercel.app/api"),
    },
  ],
  paths: {
    "/api/health": {
      get: {
        operationId: "getHealth",
        summary: "Health check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { ok: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
    "/api/check/supabase": { get: { operationId: "checkSupabase", responses: { "200": { description: "OK" } } } },
    "/api/check/notion": { get: { operationId: "checkNotion", responses: { "200": { description: "OK" } } } },
    "/api/check/airtable": { get: { operationId: "checkAirtable", responses: { "200": { description: "OK" } } } },
    "/api/check/sendgrid": { get: { operationId: "checkSendgrid", responses: { "200": { description: "OK" } } } },
    "/api/check/sentry": { get: { operationId: "checkSentry", responses: { "200": { description: "OK" } } } },
    "/api/check/slack": { get: { operationId: "checkSlack", responses: { "200": { description: "OK" } } } },
    "/api/check/gsheets": { get: { operationId: "checkGsheets", responses: { "200": { description: "OK" } } } },
  },
};

router.get("/openapi.json", (_req, res) => res.json(openapi));

export default router;
