# Lexvion Stack

This repository contains the merged Lexvion GPT stack with router, workers, Supabase definitions, vector search, observability, Slack integration and CI/CD automation.

## Quick start

1. **Clone the repository** and install any required tools (e.g. `jq`, `yamllint`, and `redocly`) for validation.

2. **Apply the Supabase schema**:
   ```sh
   supabase db reset --file supabase/supabase.sql
   ```
   The Hub API is documented in `supabase/lexvion-hub.openapi.json`.

3. **Import GPT Actions**: use the Actions OpenAPI specs (e.g. in `vector/`, `observability/`, `slack/`, `cicd/`) with your GPT orchestration system.  When calling these actions, supply the header `apikey=${SUPABASE_SERVICE_ROLE}`.

4. **Configure environment**: copy `.env.template` to `.env` and fill in your actual keys.

5. **Run smoke tests** after exporting your environment variables:
   ```sh
   export $(grep -v '^#' .env | xargs)
   bash smoke/runner.sh
   ```
   This validates that embeddings, Slack messaging, CI/CD and trace events are functioning.

6. **Approval gates**: any deployment or outbound communication should be gated with an `approval_gate` step.  Operators must approve gates in Supabase before the router proceeds.

## CI/CD

The `cicd/` directory contains example workflows (`ci.yml`, `deploy_service.yml`, `deploy_web.yml`).  These can be adapted to your own GitHub Actions or other pipeline systems.  CI status and coverage badges should be added here.
