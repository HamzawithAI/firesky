#!/usr/bin/env bash
# Runs the whole eval suite and writes a dated report to evals/reports/.
# Exits non-zero unless the inventory passes and every gated suite passes.
set -uo pipefail
cd "$(dirname "$0")/.."

# Always rebuild when the compiler is available. The previous form built only
# when dist/cli.js was absent, so an edit to src/ that was never compiled would
# be graded against the old binary — the eval oracle silently testing stale
# code. Found by the M1 adversarial pass.
#
# A FAILED build is now fatal, and this is the second half of that same fix
# (F-039). It used to log a line and carry on, so the runner graded whatever
# dist/ happened to hold and could print "**Overall: GREEN**" for a tree that
# does not compile — while the message it printed claimed the fixtures would
# report NOT_IMPLEMENTED, which was not true either. A report nobody can trust
# is worse than no report, so no report is written.
if [ -d node_modules/typescript ]; then
  if ! npm run --silent build; then
    echo "evals: TypeScript build failed. Refusing to grade a stale dist/ or write a report." >&2
    exit 2
  fi
else
  # Not a silent pass either: say plainly which binary is about to be graded.
  echo "evals: no local TypeScript; grading the existing dist/ as-is." >&2
  if [ ! -f dist/cli.js ]; then
    echo "evals: dist/cli.js is absent, so every fixture will report NOT_IMPLEMENTED." >&2
  fi
fi

# DSK_MILESTONE names the report file. It has no default milestone on purpose:
# see the runner. DSK_NOW pins the date for deterministic reports.

node evals/runner.mjs
