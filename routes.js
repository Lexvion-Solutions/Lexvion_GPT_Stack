import express from "express";
import crypto from "crypto";
import { supabase } from "./services/supabase.js";
import { notion } from "./services/notion.js";
import { airtable } from "./services/airtable.js";
import { sendMail } from "./services/sendgrid.js";

const r = express.Router();

r.post("/slack/events", express.text({ type: "*/*" }), (req, res) => {
  const sig = req.headers["x-slack-signature"];
  const ts = req.headers["x-slack-request-timestamp"];
  const base = `v0:${ts}:${req.body}`;
  const my =
    "v0=" +
    crypto
      .createHmac("sha256", process.env.SLACK_SIGNING_SECRET || "")
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
    if (payload.type === "url_verification")
      return res.status(200).send(payload.challenge);
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(200);
  }
});

r.post("/slack/interactive", (_req, res) => res.sendStatus(200));

export default r;
