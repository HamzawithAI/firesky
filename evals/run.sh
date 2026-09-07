#!/usr/bin/env bash
# Runs the whole eval suite and writes a dated report to evals/reports/.
# Exits non-zero unless the inventory passes and every fixture and scenario
# passes. At M0 that means a deliberate red: no validator exists yet (D-007).
set -uo pipefail
cd "$(dirname "$0")/.."

# Always rebuild when the compiler is available. The previous form built only
# when dist/cli.js was absent, so an edit to src/ that was never compiled would
# be graded against the old binary — the eval oracle silently testing stale
# code. Found by the M1 adversarial pass.
if [ -d node_modules/typescript ]; then
  npm run --silent build || echo "build failed; fixtures will report NOT_IMPLEMENTED" >&2
fi

# DSK_MILESTONE names the report file. It has no default milestone on purpose:
# see the runner. DSK_NOW pins the date for deterministic reports.

node evals/runner.mjs
