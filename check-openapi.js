#!/usr/bin/env node
/**
 * OpenAPI smoke validator for Lexvion GPT Stack.
 *
 * Usage:
 *   node check-openapi.js              # checks http://localhost:3000/api/openapi.json
 *   node check-openapi.js https://host/app/api/openapi.json
 *   node check-openapi.js ./openapi.json
 *
 * Env:
 *   CHECK_BASE_URL=http://localhost:3000   # used when no arg given
 */

import fs from "node:fs/promises";
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

// ---------- helpers ----------
async function readJson(source) {
  // URL input
  if (/^https?:\/\//i.test(source)) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(source, { signal: ctrl.signal, headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`GET ${source} -> ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }
  // File input
  const p = resolve(process.cwd(), source);
  const s = await stat(p);
  if (!s.isFile()) throw new Error(`Not a file: ${p}`);
  const text = await fs.readFile(p, "utf8");
  return JSON.parse(text);
}

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}
function ok(msg) {
  console.log(`✅ ${msg}`);
}

// ---------- target ----------
const base = process.env.CHECK_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const arg = process.argv[2];
const target = arg
  ? arg
  : `${base.replace(/\/+$/, "")}/api/openapi.json`;

console.log(`Checking OpenAPI at: ${target}`);

// ---------- main ----------
(async () => {
  const schema = await readJson(target);

  // Version
  if (schema.openapi !== "3.1.0") fail(`OpenAPI version must be 3.1.0, got ${schema.openapi}`);

  // Servers end with /api
  const servers = Array.isArray(schema.servers) ? schema.servers : [];
  if (!servers.some((s) => typeof s?.url === "string" && /\/api\/?$/.test(s.url))) {
    fail("No server url ending with /api found");
  }

  // Required paths present
  const paths = schema.paths || {};
  const required = [
    "/api/health",
    "/api/check/supabase",
    "/api/check/notion",
    "/api/check/airtable",
    "/api/check/sendgrid",
    "/api/check/sentry",
    "/api/check/slack",
    "/api/check/gsheets",
  ];
  const missing = required.filter((p) => !paths[p]);
  if (missing.length) fail(`Missing paths: ${missing.join(", ")}`);

  // Minimal response shape for /api/health
  const health = paths["/api/health"]?.get?.responses;
  if (!health?.["200"]) fail("Missing 200 response for /api/health");

  ok("OpenAPI validation passed");
})().catch((e) => fail(e.message || String(e)));
