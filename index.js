import express from "express";
import * as Sentry from "@sentry/node";
import routes from "./routes.js";

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

// Apply JSON parsing to everything except Slack endpoints.
// Slack needs the raw body for signature verification.
app.use((req, res, next) => {
  if (req.path.startsWith("/api/slack/")) return next();
  return express.json()(req, res, next);
});

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 3000;

// Hardcoded required env vars (from .env.template)
const REQUIRED_ENV = [
  "SENTRY_DSN",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SLACK_SIGNING_SECRET",
  "SLACK_BOT_TOKEN",
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
