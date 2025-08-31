import express from "express";
import crypto from "crypto";
import { supabase } from "./services/supabase.js";
import { notion } from "./services/notion.js";
import { airtable } from "./services/airtable.js";
import { sendMail } from "./services/sendgrid.js";
import * as Sentry from "@sentry/node";

const r = express.Router();

// Slack Events API handler with signature verification and URL
// verification challenge.  Additional event types can be handled
// inside the try block.
r.post(
  "/slack/events",
  express.text({ type: "*/*" }),
  (req, res) => {
    const sig = req.headers["x-slack-signature"];
    const ts = req.headers["x-slack-request-timestamp"];
    const base = `v0:${ts}:${req.body}`;
    const my =
      "v0=" +
      crypto
        .createHmac(
          "sha256",
          process.env.SLACK_SIGNING_SECRET || ""
        )
        .update(base)
        .digest("hex");
    if (
      !sig ||
      !process.env.SLACK_SIGNING_SECRET ||
      !crypto.timingSafeEqual(Buffer.from(my), Buffer.from(sig))
    )
      return res.sendStatus(401);
    try {
      const payload = JSON.parse(req.body);
      // Respond to Slack URL verification challenge.
      if (payload.type === "url_verification") {
        return res.status(200).send(payload.challenge);
      }
      // Respond 200 to app_mention events explicitly (Mission 3)
      if (payload.event && payload.event.type === "app_mention") {
        return res.sendStatus(200);
      }
      return res.sendStatus(200);
    } catch {
      return res.sendStatus(200);
    }
  }
);

// Slack interactive component handler.  Currently returns 200 OK.
r.post("/slack/interactive", (_req, res) => res.sendStatus(200));

// Provider configuration checks (Mission 6).  These endpoints do not
// perform any network calls; they merely report whether the relevant
// environment variable is defined.  The routes live under `/api/check/*`.
r.get("/check/sentry", (_req, res) => {
  const hasDsn = Boolean(process.env.SENTRY_DSN);
  if (hasDsn) {
    // Trigger a test exception.  This exception will be sent to Sentry
    // by the global error handler in index.js.  The response still
    // returns immediately.
    Sentry.captureException(new Error("Test Sentry error"));
  }
  res.json({ configured: hasDsn });
});

r.get("/check/notion", (_req, res) => {
  res.json({ configured: Boolean(process.env.NOTION_API_KEY) });
});

r.get("/check/airtable", (_req, res) => {
  res.json({ configured: Boolean(process.env.AIRTABLE_API_KEY) });
});

r.get("/check/supabase", (_req, res) => {
  res.json({ configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE) });
});

// Future API routes can be added here, e.g. check endpoints (Mission 6).

export default r;