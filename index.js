import express from "express";
import * as Sentry from "@sentry/node";
import routes from "./routes.js";

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", routes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("listening", port));
