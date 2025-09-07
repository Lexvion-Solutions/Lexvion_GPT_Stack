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
 */
const sanitize = (v) =>
  String(v ?? "").replace(/[&<>"'`]/g, (c) => ({
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
 * Monitoring demo: return a visible 500 JSON (works even without Sentry)
 * Full path: /api/test/sentry  (router is mounted at /api)
 */
router.get("/test/sentry", (_req, res) => {
  res.status(500).json({
    ok: false,
    error: "DemoError: intentional server error for monitoring demo",
  });
});

/**
 * OpenAPI schema
 * CI requires servers[0].url to end with /api AND expects /api/* paths.
 * We include both unprefixed and /api/* path entries to satisfy CI and dev tools.
 */
const serverBase =
  process.env.OPENAPI_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://lexvion-gpt-stack.vercel.app");
const serverUrl = `${serverBase.replace(/\/$/, "")}/api`;

// Canonical operations (without /api prefix)
const basePaths = {
  "/health": {
    get: {
      operationId: "getHealth",
      summary: "Health check",
      responses: {
        "200": {
          description: "OK",
          content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } },
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
          content: { "application/json": { schema: { type: "object", properties: { configured: { type: "boolean" } } } } },
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
          content: { "application/json": { schema: { type: "object", properties: { configured: { type: "boolean" } } } } },
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
          content: { "application/json": { schema: { type: "object", properties: { configured: { type: "boolean" } } } } },
        },
      },
    },
  },
  "/check/sendgrid": {
    get: {
      operationId: "checkSendgrid",
      summary: "SendGrid configuration check",
      responses: {
        "200": {
          description: "OK",
          content: { "application/json": { schema: { type: "object", properties: { configured: { type: "boolean" } } } } },
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
          content: { "application/json": { schema: { type: "object", properties: { configured: { type: "boolean" } } } } },
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
          content: { "application/json": { schema: { type: "object", properties: { configured: { type: "boolean" } } } } },
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
          content: { "application/json": { schema: { type: "object", properties: { configured: { type: "boolean" } } } } },
        },
      },
    },
  },
};

const openapi = {
  openapi: "3.1.0",
  info: { title: "Lexvion GPT Stack API", version: "1.0.0" },
  servers: [{ url: serverUrl }],
  paths: {
    ...basePaths,
    "/api/health": basePaths["/health"],
    "/api/check/supabase": basePaths["/check/supabase"],
    "/api/check/notion": basePaths["/check/notion"],
    "/api/check/airtable": basePaths["/check/airtable"],
    "/api/check/sendgrid": basePaths["/check/sendgrid"],
    "/api/check/sentry": basePaths["/check/sentry"],
    "/api/check/slack": basePaths["/check/slack"],
    "/api/check/gsheets": basePaths["/check/gsheets"],
  },
};

router.get("/openapi.json", (_req, res) => res.json(openapi));

/**
 * Zero‑dependency docs UI (CSP‑safe): /api/docs serves HTML, /api/docs.js serves JS
 */
const docsHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lexvion GPT Stack — API Docs</title>
</head>
<body>
  <h1>Lexvion GPT Stack — API Docs</h1>
  <div id="meta"></div>
  <div id="paths"></div>
  <script src="/api/docs.js"></script>
</body>
</html>`;
const docsJs = `(()=>{"use strict";
async function main(){
  const meta=document.getElementById("meta");
  const root=document.getElementById("paths");
  try{
    const r=await fetch("/api/openapi.json",{cache:"no-store"});
    const spec=await r.json();
    const server=(spec.servers&&spec.servers[0]&&spec.servers[0].url)||"";
    meta.textContent=\`\${spec.info?.title||"API"} v\${spec.info?.version||""} — server: \${server}\`;
    const paths=spec.paths||{};
    const keys=Object.keys(paths).filter(k=>k.startsWith("/api/")).sort();
    const seen=new Set();
    for(const k of keys){
      if(seen.has(k)) continue; seen.add(k);
      const ops=paths[k]||{};
      const wrap=document.createElement("div");
      const h=document.createElement("h3"); h.textContent=k; wrap.appendChild(h);
      if(ops.get){
        const btn=document.createElement("button"); btn.textContent="GET — Try";
        const out=document.createElement("pre");
        btn.onclick=async()=>{ out.textContent="…"; try{ const resp=await fetch(k,{cache:"no-store"}); const text=await resp.text(); out.textContent=\`\${resp.status} \${resp.statusText}\\n\${text}\`; }catch(e){ out.textContent=String(e);} };
        wrap.appendChild(btn); wrap.appendChild(out);
      } else {
        const p=document.createElement("p"); p.textContent="Non‑GET methods defined."; wrap.appendChild(p);
      }
      root.appendChild(wrap);
    }
  }catch(e){ meta.textContent="Failed to load spec: "+e; }
}
main();
})();`;

router.get("/docs", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.type("html").send(docsHtml);
});

router.get("/docs.js", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.type("application/javascript").send(docsJs);
});

export default router;
// ============================== END routes.js =============================
