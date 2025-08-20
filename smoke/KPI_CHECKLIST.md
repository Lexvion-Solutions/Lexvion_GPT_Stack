# KPI Checklist

Use this checklist to evaluate the performance and quality of your Lexvion stack deployment.

- [ ] **Time‑to‑first‑artifact:** measure the elapsed time from starting the pipeline until the first step is recorded in Supabase.  Target: < 30 seconds.
- [ ] **Rework rate (<10%)**: count the number of times a step had to be retried or corrected divided by the total number of steps.
- [ ] **Acceptance rate (≥80%)**: ratio of steps that pass their self‑tests or acceptance criteria on the first try.
- [ ] **Trace logging:** verify that each step logs at least one trace event to TraceHub; look at total_traces and model_breakdown metrics.
- [ ] **Vector operations:** confirm that `upsert_embedding` and `search_embedding` succeed and return expected results.
- [ ] **CI trigger:** ensure the CI test workflow is dispatched and completes successfully.
- [ ] **Slack notification:** confirm that Slack messages are only sent after an approval gate and are delivered to the correct channel.
