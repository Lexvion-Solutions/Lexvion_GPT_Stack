// routes.js
import express from "express";
import crypto from "crypto";

const r = express.Router();

/**
 * Slack Events (signature verified). Uses raw text to compute HMAC.
 */
r.post("/slack/events", express.text({ type: "*/*" }), (req, res) => {
  const sig = req.headers["x-slack-signature"];
  const ts = req.headers["x-slack-request-timestamp"];
  const secret = process.env.SLACK_SIGNING_SECRET || "";
  if (!sig || !secret) return res.sendStatus(401);

  const base = `v0:${ts}:${req.body}`;
  const my = "v0=" + crypto.createHmac("sha256", secret).update(base).digest("hex");

  try {
    if (!crypto.timingSafeEqual(Buffer.from(my), Buffer.from(sig))) return res.sendStatus(401);
  } catch {
    return res.sendStatus(401);
  }

  try {
    const payload = JSON.parse(req.body || "{}");
    if (payload.type === "url_verification") return res.status(200).send(payload.challenge);
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(200);
  }
});

/**
 * Slack Interactivity ACK
 */
r.post("/slack/interactive", (_req, res) => res.sendStatus(200));

/**
 * Slack Slash Command handler (/lex)
 */
r.post("/slack/command", express.urlencoded({ extended: true }), (req, res) => {
  const { text, user_name } = req.body;
  res.json({
    response_type: "in_channel",
    text: `👋 Hi @${user_name}, you ran /lex with: ${text || "(no text)"}`,
  });
});

/**
 * Integration checks
 */
r.get("/check/supabase", (_req, res) => {
  const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  res.json({ configured });
});

r.get("/check/notion", (_req, res) => {
  const configured = Boolean(process.env.NOTION_TOKEN);
  res.json({ configured });
});

r.get("/check/airtable", (_req, res) => {
  const configured = Boolean(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID);
  res.json({ configured });
});

r.get("/check/sendgrid", (_req, res) => {
  const configured = Boolean(process.env.SENDGRID_API_KEY);
  res.json({ configured });
});

r.get("/check/sentry", (_req, res) => {
  const configured = Boolean(process.env.SENTRY_DSN);
  res.json({ configured });
});

r.get("/check/slack", (_req, res) => {
  const configured = Boolean(process.env.SLACK_SIGNING_SECRET && process.env.SLACK_BOT_TOKEN);
  res.json({ configured });
});

r.get("/check/gsheets", (_req, res) => {
  const configured = Boolean(process.env.GSHEETS_CLIENT_EMAIL && process.env.GSHEETS_PRIVATE_KEY);
  res.json({ configured });
});

/**
 * OpenAPI schema for ChatGPT Actions
 */
const openapi = {
  openapi: "3.1.0",
  info: { title: "Lexvion GPT Stack API", version: "1.0.0" },
  servers: [{ url: "https://lexvion-gpt-stack.vercel.app/api" }],
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
                schema: { type: "object", properties: { ok: { type: "boolean" } } }
              }
            }
          }
        }
      }
    },
    "/check/supabase": { get: { operationId: "checkSupabase", responses: { "200": { description: "OK" } } } },
    "/check/notion":   { get: { operationId: "checkNotion",   responses: { "200": { description: "OK" } } } },
    "/check/airtable": { get: { operationId: "checkAirtable", responses: { "200": { description: "OK" } } } },
    "/check/sendgrid": { get: { operationId: "checkSendgrid", responses: { "200": { description: "OK" } } } },
    "/check/sentry":   { get: { operationId: "checkSentry",   responses: { "200": { description: "OK" } } } },
    "/check/slack":    { get: { operationId: "checkSlack",    responses: { "200": { description: "OK" } } } },
    "/check/gsheets":  { get: { operationId: "checkGsheets",  responses: { "200": { description: "OK" } } } }
  }
};

r.get("/openapi.json", (_req, res) => res.json(openapi));

export default r;
