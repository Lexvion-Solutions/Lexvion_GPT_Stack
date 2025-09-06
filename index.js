import express from "express";
import * as Sentry from "@sentry/node";
import { securityMiddleware, redactLogging, verifySlack } from "./security.js";
import routes from "./routes.js";

/**
 * Sentry
 * - Samples via SENTRY_SAMPLE_RATE or defaults to 0.1
 * - Redacts sensitive headers before sending
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.SENTRY_SAMPLE_RATE
    ? Number(process.env.SENTRY_SAMPLE_RATE)
    : 0.1,
  beforeSend(event) {
    if (event?.request?.headers) {
      ["authorization", "cookie", "x-slack-signature"].forEach((key) => {
        if (event.request.headers[key]) event.request.headers[key] = "[REDACTED]";
      });
    }
    return event;
  },
});

const app = express();
app.disable("x-powered-by"); // hide Express fingerprint

// Security headers + redacted logging
app.use(securityMiddleware);
app.use(redactLogging);

/**
 * Slack endpoints need raw body for HMAC verification.
 * After verifying, convert Buffer -> string so downstream handlers can read it.
 */
function slackGate(req, res, next) {
  verifySlack(req, res, req.body);
  if (res.headersSent) return;
  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = req.body.toString("utf8");
    } catch {
      // leave as-is if conversion fails
    }
  }
  next();
}

app.use("/api/slack/events", express.raw({ type: "*/*" }), slackGate);
app.use("/api/slack/interactive", express.raw({ type: "*/*" }), slackGate);

// JSON parser for everything else; cap size
app.use((req, res, next) => {
  if (req.path.startsWith("/api/slack/")) return next();
  return express.json({ limit: "200kb" })(req, res, next);
});

// Basic endpoints
app.get("/", (_req, res) => res.json({ ok: true }));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// API routes (includes /api/check/* and Slack handlers)
app.use("/api", routes);

// 404 + error handling
app.use((req, res) => res.status(404).json({ error: "Not Found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 3000;

// Required envs (fail fast)
const REQUIRED_ENV = [
  "SENTRY_DSN",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SLACK_SIGNING_SECRET",
  "SLACK_BOT_TOKEN",
  // "SENTRY_SAMPLE_RATE" is optional
];

(() => {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
})();

const isVercel = !!process.env.VERCEL || !!process.env.NOW_REGION;

if (!isVercel) {
  app.listen(port, () => {
    console.log("listening", port);
  });
}

export default app;
