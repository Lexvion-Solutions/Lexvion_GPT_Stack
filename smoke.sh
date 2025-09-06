#!/bin/bash
# Smoke test for Lexvion GPT Stack API.
#
# Usage: bash smoke.sh [base_url]
# Defaults to http://localhost:3000 if no base_url provided.

set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
echo "==> Running smoke tests against ${BASE_URL}"

declare -a paths=(
  "/"
  "/api/health"
  "/api/check/supabase"
  "/api/check/notion"
  "/api/check/airtable"
  "/api/check/sendgrid"
  "/api/check/sentry"
  "/api/check/slack"
  "/api/check/gsheets"
  "/api/openapi.json"
)

failed=0
for path in "${paths[@]}"; do
  url="${BASE_URL}${path}"
  echo -n "Checking ${url} ... "
  start=$(date +%s%3N || date +%s) # millisecond if supported
  resp=$(curl -fsS -w "%{http_code}" -o /tmp/smoke_resp.json "$url" || echo "000")
  code="${resp:(-3)}"
  stop=$(date +%s%3N || date +%s)

  dur=$((stop - start))
  if [[ "$code" == "200" ]]; then
    case "$path" in
      "/api/health")
        grep -q '"ok":' /tmp/smoke_resp.json || { echo "FAILED (bad body)"; failed=1; continue; }
        ;;
      "/api/openapi.json")
        grep -q '"openapi"' /tmp/smoke_resp.json || { echo "FAILED (no openapi)"; failed=1; continue; }
        ;;
    esac
    echo "OK (${code}) ${dur}ms"
  else
    echo "FAILED (${code})"
    failed=1
  fi
done

rm -f /tmp/smoke_resp.json

if [[ $failed -ne 0 ]]; then
  echo "==> Smoke tests failed." >&2
  exit 1
fi

echo "==> All smoke tests passed."
