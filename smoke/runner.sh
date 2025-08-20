#!/bin/bash
# Smoke test runner for the Lexvion stack (DRY_RUN)
# Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE, CI_BASE_URL, GITHUB_TOKEN,
#           TRACEHUB_URL, TRACEHUB_API_KEY, SLACK_BOT_TOKEN defined in the environment.

set -euo pipefail

# Generate a random project ID for testing
PROJECT_ID=$(uuidgen)
echo "Using PROJECT_ID=$PROJECT_ID"

# 1. Insert an initial step into the project
curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/rpc_add_step" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE}" \
  -H "Content-Type: application/json" \
  -d "{\"project_id\":\"$PROJECT_ID\",\"step_id\":\"init\",\"output\":{\"message\":\"initialized\"}}" \
  | tee smoke/results/rpc_add_step.json

# 2. Upsert a dummy embedding
curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/upsert_embedding" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE}" \
  -H "Content-Type: application/json" \
  -d "{\"project_id\":\"$PROJECT_ID\",\"ns\":\"test\",\"id\":\"sample\",\"content\":\"Test content for vector\",\"embedding\":[0.01,0.01,0.01],\"meta\":{\"purpose\":\"smoke_test\"}}" \
  | tee smoke/results/upsert_embedding.json

# 3. Perform a vector search
curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/search_embedding" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE}" \
  -H "Content-Type: application/json" \
  -d "{\"project_id\":\"$PROJECT_ID\",\"ns\":\"test\",\"query_embedding\":[0.01,0.01,0.01],\"top_k\":1}" \
  | tee smoke/results/search_embedding.json

# 4. Log a trace event
curl -s -X POST "${TRACEHUB_URL}/traces" \
  -H "apikey: ${TRACEHUB_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"project_id":"'$PROJECT_ID'","step_id":"init","model":"gpt-4","tokens_in":10,"tokens_out":15,"latency_ms":100}' \
  | tee smoke/results/trace_post.json

# 5. Retrieve metrics
curl -s -X GET "${TRACEHUB_URL}/metrics" \
  -H "apikey: ${TRACEHUB_API_KEY}" \
  | tee smoke/results/trace_metrics.json

# 6. Trigger a CI test run
curl -s -X POST "${CI_BASE_URL}/ci/test" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  | tee smoke/results/ci_test.json

# 7. Trigger deployments (optional)
# Uncomment to test deployments; ensure you have required secrets
# curl -s -X POST "${CI_BASE_URL}/ci/deploy/web" -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Content-Type: application/json" | tee smoke/results/ci_deploy_web.json
# curl -s -X POST "${CI_BASE_URL}/ci/deploy/service" -H "Authorization: Bearer ${GITHUB_TOKEN}" -H "Content-Type: application/json" | tee smoke/results/ci_deploy_service.json

# 8. Send a Slack message (only after approval)
# curl -s -X POST "https://slack.com/api/chat.postMessage" \
#   -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
#   -H "Content-Type: application/json" \
#   -d '{"channel":"#general","text":"Smoke test completed"}' \
#   | tee smoke/results/slack_post.json

