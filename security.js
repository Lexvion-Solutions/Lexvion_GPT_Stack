/**
 * Security middleware and request redaction (hardened).
 * Adds headers, removes Express fingerprint, and logs with duration.
 */

import crypto from "crypto";

const SECURITY_HEADERS = {
  // existing
  "X-DNS-Prefetch-Control": "off",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
  // new, safe defaults for an API
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-site",
  "X-Permitted-Cross-Domain-Policies": "none",
  // very tight CSP for JSON APIs
  "Content-Security-Policy":
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
};

export function securityMiddleware(req, res, next) {
  // remove Express fingerprint
  res.removeHeader("X-Powered-By");

  // set static headers
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);

  // optionally upgrade HSTS to preload via env toggle
  if (process.env.HSTS_PRELOAD === "true") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=15552000; includeSubDomains; preload"
    );
  }

  next();
}

// explicit keys + patterns to redact
const REDACT_HEADER_KEYS = [
  "authorization",
  "proxy-authorization",
  "cookie",
  "x-slack-signature",
];
const REDACT_PATTERNS = [/secret/i, /token/i, /signature/i, /key/i, /pass/i, /auth/i];

export function redactLogging(req, res, next) {
  const t0 = process.hrtime.bigint();

  const headers = { ...req.headers };

  // 1) explicit redactions
  REDACT_HEADER_KEYS.forEach((k) => {
    if (headers[k] !== undefined) headers[k] = "[REDACTED]";
  });

  // 2) pattern-based redactions
  Object.keys(headers).forEach((k) => {
    if (REDACT_PATTERNS.some((re) => re.test(k))) headers[k] = "[REDACTED]";
  });

  // include status and duration; still avoid body logging
  res.on("finish", () => {
    const ms = Number((process.hrtime.bigint() - t0) / 1000000n);
    console.info(`${req.method} ${req.path} ${res.statusCode} ${ms}ms`, {
      "user-agent": headers["user-agent"],
      "content-type": headers["content-type"],
      headers,
    });
  });

  next();
}

/**
 * Slack request verifier.
 * Validates signature and timestamp (±5 minutes).
 */
export function verifySlack(req, res, buf) {
  const ts = req.headers["x-slack-request-timestamp"];
  const sig = req.headers["x-slack-signature"];
  if (!ts || !sig) return res.status(401).end();

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > 300) return res.status(401).end(); // 5-min replay window

  const base = `v0:${ts}:${buf.toString("utf8")}`;
  const mac =
    "v0=" +
    crypto
      .createHmac("sha256", process.env.SLACK_SIGNING_SECRET)
      .update(base)
      .digest("hex");

  const a = Buffer.from(mac, "utf8");
  const b = Buffer.from(sig, "utf8");
  if (a.length !== b.length) return res.status(401).end();
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).end();
}
