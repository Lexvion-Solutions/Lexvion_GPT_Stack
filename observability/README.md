# Step 6 – Observability pack (TraceHub)

This step introduces a lightweight observability service called **TraceHub**.  It collects runtime metrics from GPT agents and exposes aggregated metrics for monitoring.  TraceHub is designed to run on a free‑tier platform like Railway and to stay within the Lexvion stack’s resource limits.

### Files

- `tracehub/server.js` – a minimal Node/Express application that exposes two endpoints: `/traces` (POST) to log events and `/metrics` (GET) to retrieve aggregated counts.
- `openapi.lexvion-tracehub.json` – OpenAPI 3.0 specification for the TraceHub API.  It defines the `Trace` object and a `Metrics` summary.

### Action to add

```json
{
  "name": "lexvion-tracehub",
  "spec_path": "openapi.lexvion-tracehub.json",
  "headers": {
    "apikey": "${TRACEHUB_API_KEY}"
  }
}
```

### Useful cURL commands

Log a trace event:

```sh
curl -X POST "${TRACEHUB_URL}/traces" \
  -H "apikey: ${TRACEHUB_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "<uuid>",
    "step_id": "ci_trigger",
    "model": "gpt-4",
    "tokens_in": 100,
    "tokens_out": 200,
    "latency_ms": 350
  }'
```

Get aggregated metrics:

```sh
curl -X GET "${TRACEHUB_URL}/metrics" \
  -H "apikey: ${TRACEHUB_API_KEY}"
```

### Deployment

You can deploy the TraceHub service on Railway using the workflow in step 4 or manually.  Set `TRACEHUB_URL` to the deployed endpoint and `TRACEHUB_API_KEY` to a generated secret token.  The in‑memory store in `server.js` should be replaced with a persistent database for production usage.

### Gaps

- Persistence: the provided server keeps traces in memory; deploy with a database or external store for durability.
- Monitoring: additional metrics (token counts, latency distribution) may be required for full observability.
