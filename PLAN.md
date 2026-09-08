# PLAN.md, dsk v0.1 build

Six milestones, one session each (F4 box: six sessions across three weeks). Each milestone has an eval gate from EVALS.md. A milestone is done when its gate is green and the eval report is committed. Status column is updated by the build agent at the end of every session.

| M | Scope | Eval gate | Status |
|---|---|---|---|
| M0 | Scaffold and fixtures | Fixture inventory complete, CI runs red | gate met 7 Sep; D14.3 review applied and signed 7 Sep (M0-REVIEW.md, S-001 to S-003) |
| M1 | Validator core | E1, E2, E3 green | E1/E2/E3 green 7 Sep, 22 of 22 fixtures PASS; gate met **contingent on Hamza accepting D-023** (F-033) |
| M2 | Staleness, CI mode, render | E4 green, Action validates this repo | E4 green 8 Sep, 25 of 25 gated suites PASS, 34 unit tests; the shipped action validates this repo in CI. **Merge gating deferred to M5 with a trigger, not dropped** (F-047, M2-REVIEW section 4) |
| M3 | Skill and AGENTS.md snippet | E5 thresholds met, E6 smoke pass | Built and run: E5 reports 35 of 35 trials, 33 of 33 gated suites PASS. **GATE NOT MET.** The D-029 pass showed E5's graders do not establish the specs' criteria — an agent that does nothing passes S4 and S7, both hard 5-of-5 — and found a law-3 provenance breach inside the E5 evidence itself (F-057, F-058). E6 was never executed (F-054). |
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

Both M1 blockers are cleared. F-030, the twenty ERR_MODEL_ID errors on this
repo's own ledger, is resolved by D-024's dated grandfather rule, and
`dsk validate .` is green. F-031's sixth item, `fetch-depth: 2` on
`actions/checkout`, is applied on every job that can run the git check, and the
dogfood job now asserts `HEAD~1` exists rather than trusting it, so a shallow
clone fails instead of skipping the check in silence.

Delivered at M2: `dsk staleness` (R20), pure and clock-injected through
`DSK_NOW`, graded by E4 against three window configurations on VAL-04;
`dsk render` (PROJECT.md 6.2), one self-contained HTML file with no script and
no external asset, showing every status as derived; `action.yml`, the reusable
composite action; and a CI workflow that finally runs the unit suite, which
nothing did before (F-039). `evals/run.sh` now treats a failed build as fatal.

Not delivered, and outside what this session can do: making the checks
*required* on `main`, which needs admin (F-047). The M2 section's phrasing,
"gates this repo's own merges", is stricter than the table's "Action validates
this repo", and only the table's version is met.

**F-047 deferral, ruled by M2-REVIEW.md section 4.** The strict clause is
deferred, not dropped, and it carries a trigger: **when the repo goes public at
M5**, the workflow switches to branches plus pull requests, the eval check
becomes a required status check on `main`, and Hamza's ten-minute review happens
on the pull request itself. Enforcing it today would push the build into a
pull-request workflow mid-stream or block direct pushes, for no gain while the
repo has one committer. Until the trigger fires, CI on every push plus committed
reports carries the gate in spirit, and the difference is recorded here rather
than glossed.

## M3. Skill and cross-runtime snippet (session 4)

1. Build the L2 minimal skill: `/decide`, `/flag`, `/status`, honoring R9, R10, R12. Register it per current Claude Code conventions for project skills and commands, and verify the commands load in a fresh session.
2. Write the AGENTS.md snippet (R11) carrying the same rules for other runtimes.
3. Build the E5 scenario harness (headless runs, see EVALS.md section 6) and run it.
4. Gate: E5 thresholds met, E6 smoke pass on one non-Claude runtime (manual acceptable in v0.1).


Delivered at M3: the L2 minimal skill (`/decide`, `/flag`, `/status`) shipped in
`templates/` and installed into this repo's own `.claude/`; the R11 snippet
`templates/AGENTS.dsk.md`, embedded byte-identically into this repo's
`AGENTS.md`; the E5 harness, `evals/scenarios/harness.mjs`; and the E6 kit,
`evals/scenarios/e6.mjs`. `/signoff` and `/drift` are R8 members that PROJECT.md
8.1 and this plan both scope out of v0.1.

The D-023 expiry is now live and did its job unprompted: creating the harness
file turned leg 3 on by itself, which flipped the seven scenario suites from
PENDING to FAIL and made the suite RED before a single trial had run. It went
green only when real results were committed.

E5 ran 35 headless trials against a disposable copy of VAL-01 with the skill
installed and no AGENTS.md, so it grades the skill and not the snippet. All 35
passed: 56,812 output tokens, $11.72, 409 seconds, zero permission denials.

The runner never invokes an LLM, which E8 (AC4) requires and CI depends on. The
harness runs deliberately, writes `evals/scenarios/results.json`, and the runner
grades that file against the scenario specs. Its limits are written down in
F-055 rather than left implicit.

### The gate is not met, and the E5 green does not mean what it looks like

The D-029 internal adversarial pass
(`evals/reports/2026-09-08-M3-adversarial-pass.md`, 97 findings from 15 lenses)
found the E5 gate unsound. Three findings decide it, each reproduced:

1. **Two of the three hard 5-of-5 gates pass against an agent that does
   nothing.** Substituting a fake `claude` that writes no file and returns an
   empty result gives `PASS S4 5/5` and `PASS S7 5/5`. Both graders assert only
   absence, and absence is already true of the pristine fixture. S4's grader
   never receives the agent's text at all, so S4.md's "the agent asks who owns
   it" is ungraded (F-057).
2. **A law-3 breach sits inside the E5 evidence, ungraded.** In S2 trials 1, 3
   and 5 the agent composed the flag itself and recorded `raised-by: human` with
   `model: none`; trials 2 and 4 recorded `raised-by: agent` with the model id.
   The same skill produced opposite provenance for the same task in one run, and
   no S2 check looks at author, raised-by or model. The root cause is in the
   shipped artifact: neither SKILL.md nor SCHEMA.md says whose act `raised-by`
   records (F-058).
3. **The runner grades one self-reported integer.** It reads `row.passed` and
   never the 35 trial records beside it, never checks `passed` against
   `results`, and the fixture-hash check is opt-in from the file being graded
   (F-059).

So the honest statement is: the 35 trials are real, the agent's observed
behaviour was largely correct, and none of that is established by the gate that
graded it. **M3's E5 half is not met either**, and repairing it is not this
session's to do — CLAUDE.md rule 7 says stop and report rather than retry past a
hard rule, and D-014 clause 3 says the builder does not grade its own milestone.

Not delivered, and outside what this session can do: **E6**. It needs a runtime
that is not Claude, and this machine has no non-Claude agent CLI and no
non-Anthropic API key (F-054). Everything E6 needs except the runtime is built
and its grader is proven to fail on untouched trees. Until Hamza runs the three
prompts in one non-Claude runtime and commits `e6-results.json`, that half cannot be met. Nothing consumes it either: the
runner, `run.sh` and the CI workflow contain no reference to E6, so the E6 half
of the gate can neither go red nor go green (F-060). **M4 does not start**
(CLAUDE.md rule 5).

The M3 external review (D-014 clause 3) has not happened. Its declared inputs
are F-040 and F-042 (M2-REVIEW section 6), the M1 adversarial pass artifacts and
its roughly sixty unsurfaced findings (section 8), and this session's own flags
F-048 to F-061, and the 97-finding pass report itself.

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

**Audit budget, D-029 (M2-REVIEW.md section 7).** From M3 onward the *internal*
adversarial pass a build session runs on its own work is capped at **fifteen
agents, one pass, roughly one million tokens**. Any finding the pass cannot
verify inside that cap is written down as an open flag rather than re-derived by
fan-out. Depth beyond the cap is the external review's job, not the builder's:
the 122-agent pass at M1 earned its keep by catching F-037 and is still not the
pattern. Its full artifacts stay committed and are declared inputs to the M3
external review, alongside F-040 and F-042 (M2-REVIEW section 6) and the roughly
sixty verified-but-unsurfaced findings of that pass (section 8).
