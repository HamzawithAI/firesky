# PLAN.md, dsk v0.1 build

Six milestones, one session each (F4 box: six sessions across three weeks). Each milestone has an eval gate from EVALS.md. A milestone is done when its gate is green and the eval report is committed. Status column is updated by the build agent at the end of every session.

| M | Scope | Eval gate | Status |
|---|---|---|---|
| M0 | Scaffold and fixtures | Fixture inventory complete, CI runs red | gate met 7 Sep; D14.3 review applied and signed 7 Sep (M0-REVIEW.md, S-001 to S-003) |
| M1 | Validator core | E1, E2, E3 green | E1/E2/E3 green 7 Sep, 22 of 22 fixtures PASS; gate met **contingent on Hamza accepting D-023** (F-033) |
| M2 | Staleness, CI mode, render | E4 green, Action validates this repo | not started; blocked on F-030 |
| M3 | Skill and AGENTS.md snippet | E5 thresholds met, E6 smoke pass | not started |
| M4 | Install path and degraded mode | E7 under 10 minutes, E8 green | not started |
| M5 | Dogfood live on two projects | Both repos validate green, day-zero metrics logged | not started |

## M0. Scaffold and fixtures (session 1)

1. Repo init, TypeScript strict, Node LTS, minimal deps, npm package skeleton named `decision-state-kit` (D6 placeholder).
2. Promote SCHEMA-DRAFT.md verbatim to SCHEMA.md (D8). Four ledgers per D9. Transcription only, gaps become F flags.
3. Create this repo's own `state/` ledgers and migrate the D and F entries from PROJECT.md sections 10 and 12 into them (build rule 2).
4. Write the full E1 fixture inventory from EVALS.md section 3, valid and invalid, plus expected-output files for E2. No validator code yet.
5. CI workflow that runs the eval runner. Gate: runner reports every fixture as red or not-implemented, inventory matches EVALS.md exactly.

## M1. Validator core (session 2)

1. Implement R18 (schema validation) and R19 (referential integrity) against SCHEMA.md.
2. Add `--json` machine-readable output and stable error codes per EVALS.md section 4.
3. Gate: E1, E2, E3 fully green, exit codes correct, CI green.

## M2. Staleness, CI mode, render (session 3)

1. R20 staleness report with `DSK_NOW` clock injection for deterministic tests.
2. R22 CI mode plus a GitHub Action wrapper, applied to this repo itself.
3. Minimal `render` command producing the static read-only HTML view (PROJECT.md 6.2).
4. Gate: E4 green, the Action gates this repo's own merges.

Two things found at M1 must be settled before this gate can go green. F-030:
`dsk validate .` reports twenty ERR_MODEL_ID errors on this repo's own ledger,
because M0-REVIEW 4.4 added `model:` to the flag grammar after F-005 to F-024
were written, and D-021 leaves no legal in-schema fix. F-031's sixth item: the
git-level check needs `fetch-depth: 2` on `actions/checkout`, which defaults to
a shallow clone with no `HEAD~1`, or the check silently will not apply.

## M3. Skill and cross-runtime snippet (session 4)

1. Build the L2 minimal skill: `/decide`, `/flag`, `/status`, honoring R9, R10, R12. Register it per current Claude Code conventions for project skills and commands, and verify the commands load in a fresh session.
2. Write the AGENTS.md snippet (R11) carrying the same rules for other runtimes.
3. Build the E5 scenario harness (headless runs, see EVALS.md section 6) and run it.
4. Gate: E5 thresholds met, E6 smoke pass on one non-Claude runtime (manual acceptable in v0.1).

## M4. Install path and degraded mode (session 5)

1. README with the ten-minute path: npx init, first decision, first validate.
2. E7 timing script for a fresh-environment install-to-first-validated-entry run.
3. E8 zero-LLM full run.
4. Gate: E7 under 10 minutes, E8 green.

## M5. Dogfood live (session 6)

1. Initialize `state/` in two real project repos (candidates per PROJECT.md 8.2: MARSAD and the build system repo).
2. Set up `metrics.md` logging per EVALS.md section 10, record the day-zero baseline, start the fourteen-day clock.
3. Publish the repo under D5 (MIT) unless overridden before this milestone.
4. Gate: both project repos validate green, baseline committed. Kill lines K1 to K3 in PROJECT.md 8.6 govern from here.

## Deferred, do not build in v0.1

L3 MCP server, R21 drift check, R23 LLM review pass, remote transport, any sync bridge or UI. Un-defer criteria live in PROJECT.md 6.4 and 8.6.

## Review gates (D14)

After M0 and after M3, an external review happens before the next milestone starts: a session or model that did not build the milestone receives PROJECT.md, EVALS.md, SCHEMA.md, the eval report, and the diff summary, and hunts for spec drift, weakened fixtures, and overstated reports. The build agent waits for its findings. Findings become F flags or fixes before proceeding.
