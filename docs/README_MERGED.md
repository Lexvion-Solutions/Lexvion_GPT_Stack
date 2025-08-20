# Merged Lexvion Stack

This merged package consolidates multiple sources:

- **BASE**: core stack with router instructions, named worker definitions, CI/CD workflows, vector, observability, Slack integration, smoke tests and secrets template.
- **POLISH**: patches that provide updated router output schema (v1.1), golden test samples, additional observability and Slack documentation, CI action specifications and supplementary smoke test expectations.  These were merged without overwriting newer base files.
- **LEGACY**: older worker operator documentation used to backfill missing fields.  In this merge the BASE already contained full operator docs; LEGACY content was not required.

The result is a coherent `lexvion-stack/` directory that can be used as both a self‑contained artifact package and a GitHub‑ready repository.
