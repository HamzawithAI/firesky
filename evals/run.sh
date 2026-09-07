#!/usr/bin/env bash
# Runs the whole eval suite and writes a dated report to evals/reports/.
# Exits non-zero unless the inventory passes and every fixture and scenario
# passes. At M0 that means a deliberate red: no validator exists yet (D-007).
set -uo pipefail
cd "$(dirname "$0")/.."

if [ ! -f dist/cli.js ] && [ -d node_modules/typescript ]; then
  npm run --silent build || echo "build failed; fixtures will report NOT_IMPLEMENTED" >&2
fi

node evals/runner.mjs
