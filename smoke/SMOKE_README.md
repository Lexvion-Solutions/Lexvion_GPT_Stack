# Step 8 – End‑to‑end smoke test (DRY_RUN)

This package provides a self‑contained smoke test to verify that the Lexvion stack has been provisioned correctly.  Because no secrets were available at build time, this test is generated in **DRY_RUN** mode and does not make live API calls.  To execute the test:

1. Ensure you have deployed the Supabase schema, vector functions and TraceHub service, and configured CI/CD and Slack as described in previous steps.
2. Copy `.env.template` to `.env` and populate all required environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `CI_BASE_URL`, `GITHUB_TOKEN`, `TRACEHUB_URL`, `TRACEHUB_API_KEY`, `SLACK_BOT_TOKEN`).
3. Create a directory called `smoke/results` in the same folder as `runner.sh`.
4. Run the script:

   ```sh
   bash runner.sh
   ```

   The script will:

   - Generate a random project ID.
   - Insert an initial step into the Supabase hub via `rpc_add_step`.
   - Upsert a dummy embedding and perform a similarity search.
   - Log a trace event and fetch metrics from TraceHub.
   - Trigger a CI test run.  Deployment steps and Slack messages are commented out by default; uncomment them if you wish to test those flows.

5. Compare the responses saved in `smoke/results/` against the examples in `expected_responses/`.  Minor differences (timestamps, IDs) are expected, but the structure should match.

### KPI Checklist

- **Time‑to‑first‑artifact**: measure how long it takes to produce the first valid output after kicking off the pipeline.  Target < 30 s.
- **Rework rate**: aim for <10% (number of retries or corrected steps divided by total steps).
- **Acceptance**: ensure ≥80% of steps pass their self‑tests on the first run.

### Failure playbook

See `FAILURE_PLAYBOOK.md` for common error scenarios and recommended fixes.
