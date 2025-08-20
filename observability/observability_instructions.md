# Observability Instructions

This package defines trace event schemas and the TraceHub API.

To emit a trace event, POST to `/traces` with a JSON payload matching `trace_events.schema.json`. Ensure that services include appropriate level (info, warning, error) and timestamps in ISO format.
