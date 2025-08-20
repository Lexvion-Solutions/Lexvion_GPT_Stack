# Failure Playbook

This document lists common failure scenarios encountered when running the Lexvion stack and how to resolve them.

## Missing or invalid secrets

- **Symptom**: API calls return 401/403 or host not found.
- **Resolution**: Verify that `.env` contains correct values for all required variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE, GITHUB_TOKEN, VERCEL_TOKEN, RAILWAY_TOKEN, TRACEHUB_URL, TRACEHUB_API_KEY, SLACK_BOT_TOKEN).  Ensure there are no surrounding quotes and that the Supabase URL includes the scheme (https://).

## Supabase RPC errors

- **Symptom**: `rpc_add_step` or `rpc_state` returns 500 with `permission denied` or `function does not exist`.
- **Resolution**: Ensure that the SQL migrations in steps 1 and 5 have been applied to your Supabase database.  Check that the `rpc_state`, `rpc_add_step`, `upsert_embedding` and `search_embedding` functions exist.  Confirm that RLS policies permit the service role to execute these functions.

## Vector search returns empty results

- **Symptom**: `search_embedding` returns an empty array even though you inserted a vector.
- **Resolution**: Make sure that the `project_id` and `ns` values in the search request exactly match those used when inserting the embedding.  Also verify that the dimension of the query vector (1536) matches the dimension of stored embeddings.  If using test data, small vectors are accepted but may produce low scores.

## TraceHub unreachable

- **Symptom**: cURL requests to TraceHub endpoints time out or return 404.
- **Resolution**: Deploy the TraceHub service (step 6) and set `TRACEHUB_URL` to its base URL (e.g. https://tracehub.example.com).  Ensure your platform (Railway) allows inbound requests on the configured port.  Check that `TRACEHUB_API_KEY` matches the key expected by the service.

## CI jobs not triggered

- **Symptom**: calls to CI endpoints return 404 or no workflow runs appear in GitHub.
- **Resolution**: Deploy the Lexvion CI service (or integrate the openapi spec into your router) and set `CI_BASE_URL` accordingly.  Confirm that your GitHub token has permissions to dispatch workflows and that the repository contains the workflow files from step 4.  Also verify the secrets `VERCEL_TOKEN`, `RAILWAY_TOKEN` and `RAILWAY_PROJECT_ID` are correctly set in the GitHub repository.

## Slack messages not delivered

- **Symptom**: Slack API call returns an error response or nothing appears in the channel.
- **Resolution**: Ensure the Slack bot is installed in the target workspace and has permission to post to the channel.  Double‑check `SLACK_BOT_TOKEN`.  Remember to place an approval gate before sending messages; the router should not post to Slack unless the gate has been approved.
