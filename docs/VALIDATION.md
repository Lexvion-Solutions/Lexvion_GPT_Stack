# Validation Checklist

- [x] **Router schema v1.1** present as `router/output.schema.json` with `schema_version` and step fields `type`, `risk`, `idempotency_key`, `revision`, and a maximum of six steps.
- [x] **10 workers** present under `workers/` with `instructions.md`, `input.schema.json`, `output.schema.json`, `routing_rules.md`, `handoff_note.txt`, `conversation_starters.txt`, `self_test.json` and `golden_tests/test1.json`.
- [x] **Supabase** directory contains `supabase.sql` and `lexvion-hub.openapi.json`.
- [x] **CI/CD workflows** located in `cicd/` with `ci.yml`, `deploy_service.yml`, `deploy_web.yml`, and OpenAPI spec.
- [x] **Vector** directory contains SQL and API definitions from the base plus additional scripts from polish.
- [x] **Observability** directory includes tracehub server files and schema plus additional instructions and OpenAPI definitions.
- [x] **Slack** directory contains Slack OpenAPI definitions and approval notes.
- [x] **Smoke** directory includes `runner.sh` (Unix users should `chmod +x runner.sh`) and merged `expected_responses` files, along with smoke documentation.
- [x] **Secrets template** `.env.template` present with merged keys and sorted entries.

