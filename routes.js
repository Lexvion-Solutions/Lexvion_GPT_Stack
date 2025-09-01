// routes.js
import express from "express";
import crypto from "crypto";

const r = express.Router();

/**
 * Slack Events (signature verified).
 * Use raw text body parser so JSON middleware doesn't consume it first.
 */
r.post("/slack/events", express.text({ type: "*/*" }), (req, res) => {
  const sig = req.headers["x-slack-signature"];
  const ts = req.headers["x-slack-request-timestamp"];
  const base = `v0:${ts}:${req.body}`;
  const secret = process.env.SLACK_SIGNING_SECRET || "";

  if (!sig || !secret) return res.sendStatus(401);

  const my = "v0=" + crypto.createHmac("sha256", secret).update(base).digest("hex");

  try {
    if (!crypto.timingSafeEqual(Buffer.from(my), Buffer.from(sig))) {
      return res.sendStatus(401);
    }
  } catch {
    return res.sendStatus(401);
  }

  try {
    const payload = JSON.parse(req.body || "{}");
    if (payload.type === "url_verification") {
      return res.status(200).send(payload.challenge);
    }
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
    response_type: "in_channel", // visible to channel
    text: `👋 Hi @${user_name}, you ran /lex with: ${text || "(no text)"}`,
  });
});

/**
 * --- Check endpoints (lightweight config checks) ---
 * Each returns { configured: true/false } depending on env vars present
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

export default r;
