#!/bin/bash
# Run optional validators on JSON, YAML and OpenAPI files (if the tools are installed).

set -e

# JSON files
if command -v jq >/dev/null 2>&1; then
  echo "Validating JSON files with jq..."
  find .. -name '*.json' -not -path '*node_modules*' -print0 | xargs -0 -n1 jq empty
fi

# YAML files
if command -v yamllint >/dev/null 2>&1; then
  echo "Validating YAML files with yamllint..."
  find .. -name '*.yml' -o -name '*.yaml' | xargs yamllint
fi

# OpenAPI docs
if command -v redocly >/dev/null 2>&1; then
  echo "Bundling and linting OpenAPI specs with redocly..."
  find .. -name '*.openapi.json' -print | while read f; do
    redocly lint "$f"
  done
fi

echo "Post-merge checks completed."
