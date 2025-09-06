// ============================= BEGIN routes.js =============================
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
 * Minimal sanitizer for reflected text in Slack responses.
 * Escapes characters relevant to XSS even in JSON contexts.
 */
const sanitize = (v) =>
  String(v ?? "")
    .replace(/[&<>"'`]/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "`": "&#96;",
    })[c]);

const clamp = (s, n) => (s.length > n ? s.slice(0, n) : s);

/**
 * Slack Slash Command (/lex)
 * Uses raw body (set in index.js) so HMAC verification can run first.
 * We parse urlencoded ourselves to avoid consuming the raw body earlier.
 */
router.post("/slack/command", (req, res) => {
  try {
    const bodyStr = typeof req.body === "string" ? req.body : "";
    const params = new URLSearchParams(bodyStr);
    const text = params.get("text") || "(no text)";
    const user_name = params.get("user_name") || "user";

    const safeUser = clamp(sanitize(user_name), 80);
    const safeText = clamp(sanitize(text), 300);

    res.set("X-Content-Type-Options", "nosniff");
    return res.json({
      response_type: "in_channel",
      text: `👋 Hi @${safeUser}, you ran /lex with: ${safeText}`,
    });
  } catch (err) {
    console.error("slack/command parse error", err);
    return res.status(400).json({ error: "Bad Slack command payload" });
  }
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
 * Monitoring demo: force a server error to exercise Sentry
 * NOTE: Router is mounted under /api, so full path is /api/test/sentry.
 */
router.get("/test/sentry", (_req, _res, next) => {
  const err = new Error("DemoError: intentional server error for monitoring demo");
  err.status = 500;
  next(err);
});

/**
 * OpenAPI schema
 * CI requires servers[0].url to END with /api.
 * Therefore servers.url ends with /api and PATHS OMIT the /api prefix.
 */
const serverBase =
  process.env.OPENAPI_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://lexvion-gpt-stack.vercel.app");

const serverUrl = `${serverBase.replace(/\/$/, "")}/api`;

const openapi = {
  openapi: "3.1.0",
  info: { title: "Lexvion GPT Stack API", version: "1.0.0" },
  servers: [{ url: serverUrl }],
  paths: {
    "/health": {
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
    "/check/supabase": {
      get: {
        operationId: "checkSupabase",
        summary: "Supabase configuration check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { configured: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
    "/check/notion": {
      get: {
        operationId: "checkNotion",
        summary: "Notion configuration check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { configured: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
    "/check/airtable": {
      get: {
        operationId: "checkAirtable",
        summary: "Airtable configuration check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { configured: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
    "/check/sendgrid": {
      get: {
        operationId: "checkSendgrid",
        summary: "Sendgrid configuration check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { configured: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
    "/check/sentry": {
      get: {
        operationId: "checkSentry",
        summary: "Sentry configuration check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { configured: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
    "/check/slack": {
      get: {
        operationId: "checkSlack",
        summary: "Slack configuration check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { configured: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
    "/check/gsheets": {
      get: {
        operationId: "checkGsheets",
        summary: "Google Sheets configuration check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "object", properties: { configured: { type: "boolean" } } },
              },
            },
          },
        },
      },
    },
  },
};

router.get("/openapi.json", (_req, res) => res.json(openapi));

/**
 * Public OpenAPI viewer (no deps) at /api/docs
 * Renders Redoc against the live /api/openapi.json
 *
 * NOTE: This router is mounted under /api in index.js, so the route is /api/docs.
 */
const redocHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta http-equiv="x-ua-compatible" content="ie=edge"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Lexvion GPT Stack — API Docs</title>
  <link rel="icon" href="data:,">
  <style>
    html,body { height:100%; margin:0; }
    body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
    redoc { height: 100vh; }
  </style>
</head>
<body>
  <redoc spec-url="/api/openapi.json"></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@2.1.4/bundles/redoc.standalone.js" crossorigin="anonymous"></script>
</body>
</html>`;

router.get("/docs", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.type("html").send(redocHtml);
});

export default router;
// ============================== END routes.js ==============================
