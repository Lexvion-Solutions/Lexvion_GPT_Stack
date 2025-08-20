# Smoke Test Report

## Summary
This smoke test script (`runner.sh`) orchestrates the creation of a step, state retrieval, vector operations, trace event submission, Slack notification, and CI trigger.

## Status
All operations are executed in DRY_RUN mode due to missing live credentials. Replace placeholders in `.env.template` with actual values for live execution.

## Results
Expected responses are stored in the `expected_responses` directory. Since this is a dry run, the script does not validate responses.
