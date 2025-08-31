import express from "express";
import * as Sentry from "@sentry/node";
import fs from "fs";
import routes from "./routes.js";

// Initialise Sentry.  The DSN should be provided via SENTRY_DSN in the
// environment.  No DSN means Sentry will be a no-op.
Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();
app.use(express.json());

// Minimal request logging.  Logs only the HTTP method and path to
// stdout.  Do not log headers, bodies or secrets.
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Root route for quick checks.  Returns the same payload as the
// health endpoint.
app.get("/", (_req, res) => {
  res.json({ ok: true });
});

// Health route used by deployment platforms for uptime checks.  It
// must return { ok: true }.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Mount API routes (including Slack handlers) under /api.
app.use("/api", routes);

// 404 handler – if no previous route handled the request, return
// Not Found.  Keep the payload simple.
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Generic error middleware.  Capture any unexpected errors and
// respond with a 500.  Do not leak error details to the client.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 3000;
// Before starting the server, ensure all required environment
// variables are present.  Read `.env.template` to determine the
// expected names.  If any are missing, log the missing names and
// exit immediately.
(() => {
  try {
    const template = fs.readFileSync(new URL("./.env.template", import.meta.url));
    const required = String(template)
      .split(/\r?\n/)
      .map((line) => line.split("=")[0].trim())
      .filter((name) => name);
    const missing = required.filter((name) => !process.env[name]);
    if (missing.length > 0) {
      console.error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
      process.exit(1);
    }
  } catch (err) {
    // If the template file cannot be read we still proceed; the
    // check will be bypassed.  Log the error for debugging.
    console.error(err);
  }
})();

app.listen(port, () => {
  console.log("listening", port);
});