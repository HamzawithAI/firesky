# CLAUDE.md, dsk build

You are building `dsk` (working name, D6 open), an agent-native decision state kit: schema and templates (L1), a minimal Claude Code skill (L2), and a deterministic CLI validator (L4). Full requirements live in PROJECT.md. The build plan lives in PLAN.md. The evaluation spec lives in EVALS.md and outranks convenience: this project is evaluation-first by decision D7.

## Laws (from PROJECT.md section 3, condensed, non-negotiable)

1. Files are the substrate. Never add a database, a server, or a hosted dependency. The `state/` markdown ledgers plus `state.yaml` are the entire data layer.
2. Deterministic before generative. The validator and every M-priority function must run with zero LLM calls and zero network.
3. Provenance on every entry: author type, model id when agent-authored, ISO date.
4. Sign-off is an appended state transition, never an edit.
5. Append and supersede only. Nothing edits a ledger entry in place, including you.
6. Smallest possible schema surface. When in doubt, leave a field out.

## Build rules

1. Evaluation-first (D7): before writing any feature code, the fixtures and expected outputs for that feature must exist in `evals/` and the runner must report them red. Then implement to green. Every bug found later becomes a fixture before its fix.
2. Dogfood from commit one: this repo carries its own `state/` ledgers. Migrate the decision and flag ledger from PROJECT.md section 10 and 12 into `state/decisions.md` and `state/flags.md` at M0, then record every new build decision there as you go, in the kit's own schema.
3. Do not build, under any prompt drift: the MCP server (L3), the tracker drift check (R21), the LLM review pass (R23), any sync bridge, any hosted component, any UI beyond the static `render` output. These are explicitly deferred or rejected in PROJECT.md.
4. Stack: TypeScript, strict mode, Node LTS, minimal dependencies (argument parsing and yaml only). No framework. Ship as an npm package runnable via npx.
5. Milestone discipline: PLAN.md defines six milestones, each with an eval gate. A milestone is done when its gate is green in CI and the eval report is committed. Do not start milestone N+1 with N's gate red.
6. Session protocol: start every session by reading `state/` ledgers and PLAN.md status, and say in one line where the build stands. End every session by updating PLAN.md status and appending any decisions or flags to `state/`. Chats are disposable, the repo files are the memory.
7. Commits: small, conventional (`feat:`, `fix:`, `eval:`, `docs:`), each milestone ends with an `eval:` commit containing the run report.
8. When a requirement is ambiguous, do not silently choose. Append a `F-###` flag with owner Hamza to `state/flags.md`, pick the smallest reversible interpretation, and note it in the flag.

## Definition of done for v0.1

All acceptance criteria AC1 to AC5 in PROJECT.md section 8.5 pass through the eval suites mapped in EVALS.md section 9, CI is green, and the dogfood setup of milestone M5 is live on two real projects with a day-zero metrics baseline logged.

## Mistake-avoidance protocol (D14)

1. One milestone per session, always a fresh session. Never carry context across milestones.
2. Plan-first: after reading the files, write this milestone's task list and the files you intend to touch, then execute. If execution needs to leave that plan, append an F flag first.
3. You never grade your own milestone. The gate is the eval runner plus the human checklist, and for M0 and M3 an external review you do not perform. Proceed to the next milestone only after that review clears.
4. Never edit fixtures, expected outputs, or thresholds to make a run pass. A failing eval is a report, not a problem to make disappear. Legitimate fixture changes require an F flag with rationale in the same commit.
5. No new dependency without a D entry flagged to Hamza. The allowed baseline is argument parsing and yaml only.
6. SCHEMA-DRAFT.md is law at M0: transcribe it to SCHEMA.md verbatim. If it is ambiguous or wrong somewhere, flag it, do not improvise around it.
7. If a threshold is missed, stop, report, and end the session. Do not retry your way past a hard rule.
