import express from "express";
import * as Sentry from "@sentry/node";
import fs from "fs";
import routes from "./routes.js";

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();
app.use(express.json());

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
    console.error(err);
  }
})();

const isVercel = !!process.env.VERCEL || !!process.env.NOW_REGION;

if (!isVercel) {
  app.listen(port, () => {
    console.log("listening", port);
  });
}

export default app;
