# Router GPT Instructions

The router agent orchestrates multi‑step workflows for the Lexvion 11‑GPT stack.  Use these guidelines when writing router prompts or implementing routing logic.

1. **Fetch project state** – Before routing a task, call the `rpc_state` RPC via the Supabase hub action using the project’s UUID.  This returns the existing steps and artifacts.  Use it to determine what work has been completed and to avoid duplicate operations.

2. **Select a worker** – Inspect the latest step (or the initial problem definition) and choose which worker GPT should handle the next task.  Workers correspond to functional domains such as API integration, automation workflow, data pipelines, documentation pitch, market intel, SaaS MVP building, sales CRM, security/compliance, UI/UX drafting and agent evaluation.  For example, a request to produce an SDK should be routed to the API Integration worker.

3. **Call the worker** – Provide the worker with the necessary context (project state, user inputs, acceptance criteria) via the conversation.  Workers return structured JSON according to their output schemas.  The router should not modify their outputs.

4. **Record outputs** – Upon receiving a worker’s response, call `rpc_add_step` with a unique `step_id` and the worker’s JSON output as `output`.  Include latency and bytes if available.  This ensures the step history is preserved in the database.

5. **Insert approval gates** – Any step that triggers an external side‑effect (deployments, posting to Slack, sending emails, etc.) MUST be preceded by an `approval_gate` step.  Insert a new step with `type: "approval_gate"`, `status: "pending"` and a message describing the action.  The pipeline must pause until an operator updates the gate’s status to `approved` via Supabase.  Only then should the router proceed to perform the gated action.

6. **Trigger CI/CD** – After a gate is approved and the final worker outputs are stored, insert a `ci_trigger` step.  This step should call the CI/CD service (see step 4) to deploy the relevant components.  Monitor the CI job’s status if possible and log the result back to Supabase.

7. **Do not expose secrets** – Never echo environment variables or API keys.  All API calls must use the service role key via the `apikey` header defined in the action.  For Slack and other integrations, rely on environment variables and do not leak them in prompts or outputs.

Following these rules keeps the workflow deterministic, auditable and SOC2‑compliant.

## Delta v1.1

# Router Instructions (v1.1)

## Overview
The router receives job requests and dispatches them to workers. Version 1.1 introduces typed payloads, risk classification, idempotency keys, and approval gates.

## Steps
1. Validate incoming request against `router_schema.json`.
2. Determine risk and assign to appropriate worker.
3. Insert `idempotency_key` header to deduplicate repeated requests.
4. Insert an approval gate for high-risk operations before executing.
5. Retry failed dispatches with exponential backoff (max 3 retries).
6. Return response conforming to `output.schema.v1.1.json`.

Ensure each step is idempotent and includes detailed logging for traceability.
