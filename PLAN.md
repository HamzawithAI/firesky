# PLAN.md, dsk v0.1 build

Six milestones, one session each. Each milestone has an eval gate from EVALS.md. A milestone is done when its gate is green and the eval report is committed. Status column is updated by the build agent at the end of every session.

**The box: eight sessions, resized consciously (F-065, M3-REVIEW.md section
10).** F-004 set six across three weeks. Four are spent on M0 to M3, the M3
fix-and-rerun is the fifth, and M4 and M5 make seven; E6 and the re-evaluated M3
gate sit between. Eight is the honest number with everything else unchanged. The
alternative, trimming M4's scope to fit, is available and not recommended: the
install path is the shareability of the whole product. This is a resize for
Hamza's sign-off, not a drift, and it is recorded before it is used.

**Six spent, as of 8 Sep.** The second M3 fix session, applying M3-REVIEW-2.md,
is the sixth, and it was not in the eight the resize counted: F-065's arithmetic
had one fix session, not two. The box is now eight with the second review session
inside it only if M4 and M5 take one session each and E6 costs Hamza fifteen
minutes rather than a session. That is the honest reading and it is not a second
resize; if M4 or M5 needs two, the number moves again and will be flagged before
it is used, not after.

| M | Scope | Eval gate | Status |
|---|---|---|---|
| M0 | Scaffold and fixtures | Fixture inventory complete, CI runs red | gate met 7 Sep; D14.3 review applied and signed 7 Sep (M0-REVIEW.md, S-001 to S-003) |
| M1 | Validator core | E1, E2, E3 green | E1/E2/E3 green 7 Sep, 22 of 22 fixtures PASS; gate met **contingent on Hamza accepting D-023** (F-033) |
| M2 | Staleness, CI mode, render | E4 green, Action validates this repo | E4 green 8 Sep, 25 of 25 gated suites PASS, 34 unit tests; the shipped action validates this repo in CI. **Merge gating deferred to M5 with a trigger, not dropped** (F-047, M2-REVIEW section 4) |
| M3 | Skill and AGENTS.md snippet | E5 thresholds met, E6 smoke pass | M3-REVIEW-2.md applied in full (D-035 locked by S-009; F-052 and F-066 closed by S-010). F-066 fixed at its root: the exemption, the example on four surfaces, a frozen fixture and ten unit tests. **E5 is 35 of 35 by verdict and RED by gate**, on mixed provenance the protocol cannot represent (F-069): six scenarios re-graded from run 2026-09-08T14-46-24Z's artifacts under the amended validator, every verdict outside S3 unchanged, and S3 re-run fresh at 5 of 5, $1.80. E6 is now wired into the runner, the exit code and CI, and is red because it is unexecuted (F-054; F-060 closed as to wiring). **GATE STILL NOT MET**, and this session does not re-evaluate it. |
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
harness runs deliberately and the runner grades what it wrote. (At M3 that was a
single `evals/scenarios/results.json` graded as a file of integers; D-032
replaced both halves of that sentence in session five, below.) Its limits are
written down in F-055 rather than left implicit.

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

## M3 fix-and-rerun (session 5)

The M3 external review, `M3-REVIEW.md`, applied as a commit series. It concurred
that the gate was not met and ruled that what failed was the measurement layer,
not the skill: two vacuous hard gates, a provenance semantics gap inside the
evidence, self-reported counts, forgeable and nearly destroyed results, and E6
never executed.

Applied and signed. **D-030**, `raised-by` records the actor that composed and
wrote the entry, in SCHEMA.md and SKILL.md, with the hard provenance assertion
added to S2's grader. **D-031**, S4 and S7 redesigned as paired actions — one
benign verifiable write, then the forbidden act — so a pass needs liveness and
selectivity together and a null agent fails the benign leg; the placeholder-owner
test becomes a pattern rather than eleven literals. **D-032**, the evidence
protocol: timestamped run files that are never overwritten, per-trial raw
artifacts committed alongside, and a runner that re-derives every pass count from
those artifacts by replaying each diff onto a fresh seed. **D-033**, ERR_DUP_KEY
and INV-19, the sixteenth code, closing the F-052 close call structurally.
**D-034** supersedes D-029 with the amended budget semantics. **F-065** records
the box resized to eight sessions. **S-007** locks the five decisions and closes
F-065; **S-008** closes F-040 and F-042. F-052 is deliberately left open, because
section 7 says "upheld" and a sign-off scope cannot be un-named.

Also closed here, from the twelve gate-level findings: the empty-`fixtures`
bypass, the PENDING downgrade of a recorded failure, the unhashed slash commands
and validator, the claimable `absent` hash, duplicate scenario rows, the
uncross-checked thresholds, and the corrupted multi-byte output. F-062, F-063,
F-064 and F-066 disclose what this session chose beyond the review's letter.

**The re-run: 34 of 35, and the gate is still not met.** 63,679 output tokens,
$12.63, 597 seconds, zero permission denials, every count re-derived from
committed artifacts rather than read. S1 5/5, S2 5/5, S3 **4/5**, S4 5/5, S5
5/5, S6 5/5, S7 5/5. The repaired measurement immediately found something the
old one could not see: S3 trial 4 refused the edit exactly as specified, kept
D-001 byte-identical, appended a proper superseder — and went red on
ERR_STALE_REF, because the one worked supersede example the skill and the
snippet both ship writes `links: [D-001]` beside `supersedes: D-001`, which
D-028 clause 3 makes a hard error. The agent followed the instruction; the
instruction is wrong (F-066, findings 37 and 41).

Not fixed in this session, under CLAUDE.md rule 7: a missed threshold is stopped
and reported, not retried. The fix also changes the graded artifact, which
invalidates the run's tamper seal and costs another thirty-five trials, and the
choice between deleting the `links` line and widening D-028 clause 3 is a schema
question for Hamza and the external review.

**E6 remains Hamza's step.** The three trees are built, the procedure is
printed, and `evals/scenarios/e6-results.json` is the only artifact that
survives. The M3 gate is re-evaluated only once that file is committed, and M4
does not start before then.

## M3 fix-and-rerun, second pass (session 6)

The second M3 external review, `M3-REVIEW-2.md`, applied as a commit series. It
ruled the previous session MET, ruled on F-066, put E6 into the suite, accepted
the finding-12 residue as a known limit, and authorised a re-grade rather than a
second full paid run.

Applied and signed. **D-035**, the same-entry supersedes exemption: a `links`
member is exempt from ERR_STALE_REF when the same entry's `supersedes:` names the
same id, per member and no wider. The worked example drops the redundant `links`
line on all four shipped surfaces, VAL-02 carries the exempt pattern as D-005 and
D-006 (F-067), and ten unit tests hold it: six on the boundary of the exemption,
and four that lift the example out of each shipped surface and validate it, so
the class of defect that produced F-066 is graded rather than merely fixed. **S-009** locks D-035;
**S-010** closes F-052 and F-066, the closure S-008 could not make because
M3-REVIEW.md had said only "upheld".

**E6 is in the suite (F-060).** The runner grades
`evals/scenarios/e6-results.json`, its absence is a FAIL rather than a PENDING,
and CI carries it through `run.sh`'s exit code. The E6 kit's three recorded holes
are closed in the same commit, because a gate satisfiable by renaming a directory
is not a gate: ids come from a setup manifest, the seed commit is pinned and the
diff taken against it, a `dsk` shim goes on PATH outside the trial trees, and
`grade` requires a named non-Claude runtime and seals the snippet and validator
(F-068). EVALS section 7 records what E6's evidence is worth: one attested manual
run, not a replayable one.

**The re-grade: 35 artifacts, zero new trials, one authorised change.** Every
scenario re-derives 5 of 5 under the amended validator; the only movement is S3
trial 4, `fail→pass`, which is the F-066 pattern the exemption legalises. Five
fresh S3 trials under the amended skill then scored 5 of 5 at $1.80, and none of
them wrote the redundant link.

**What is red, and why it is red.** The gate grades one results file, and no
single file covers the authorised mixed provenance: S3's fresh run is a partial
run, and the run covering the other six has a stale skill and validator seal
because amending both is what this series did. All seven rows are FAIL. The gate
was deliberately not widened to grade the union of runs — it would green nothing
today and would make cherry-picking cost two dollars instead of twelve — and the
gap is recorded in F-069 with the two ways to close it. E5 goes green on one full
thirty-five-trial run under the current skill and validator, about $12.63, which
is exactly the cost F-064 disclosed when it sealed the validator.

**E6 remains Hamza's step, and it is now the whole of the M3 gate's remainder.**
`node evals/scenarios/e6.mjs setup` prints the refreshed procedure, including the
PATH line the snippet's instructions need. The M3 gate is re-evaluated only once
`evals/scenarios/e6-results.json` is committed, and M4 does not start before then.

## M4. Install path and degraded mode (session 7)

1. README with the ten-minute path: npx init, first decision, first validate.
2. E7 timing script for a fresh-environment install-to-first-validated-entry run.
3. E8 zero-LLM full run.
4. Gate: E7 under 10 minutes, E8 green.

## M5. Dogfood live (session 8)

1. Initialize `state/` in two real project repos (candidates per PROJECT.md 8.2: MARSAD and the build system repo).
2. Set up `metrics.md` logging per EVALS.md section 10, record the day-zero baseline, start the fourteen-day clock.
3. Publish the repo under D5 (MIT) unless overridden before this milestone.
4. Gate: both project repos validate green, baseline committed. Kill lines K1 to K3 in PROJECT.md 8.6 govern from here.

## Deferred, do not build in v0.1

L3 MCP server, R21 drift check, R23 LLM review pass, remote transport, any sync bridge or UI. Un-defer criteria live in PROJECT.md 6.4 and 8.6.

## Review gates (D14)

After M0 and after M3, an external review happens before the next milestone starts: a session or model that did not build the milestone receives PROJECT.md, EVALS.md, SCHEMA.md, the eval report, and the diff summary, and hunts for spec drift, weakened fixtures, and overstated reports. The build agent waits for its findings. Findings become F flags or fixes before proceeding.

**Audit budget, D-029 as amended by D-034 (M2-REVIEW.md section 7, M3-REVIEW.md
section 6).** From M3 onward the *internal* adversarial pass a build session
runs on its own work is capped at **fifteen agents, one pass, roughly one
million tokens**. D-034 settles what the cap counts, which D-029 left open
(F-056): **the cap is per completed pass**, an attempt killed by infrastructure
or plan limits is recorded as spend rather than as a pass, and a running pass
that approaches the cap **stops and files the remainder as open flags instead of
finishing large**. The M3 overrun — 1.96M against roughly 1M, 2.4M with the
failed first attempt — is accepted once, on the strength of two law-level
findings, and is explicitly not precedent. Any finding the pass cannot
verify inside that cap is written down as an open flag rather than re-derived by
fan-out. Depth beyond the cap is the external review's job, not the builder's:
the 122-agent pass at M1 earned its keep by catching F-037 and is still not the
pattern. Its full artifacts stay committed and are declared inputs to the M3
external review, alongside F-040 and F-042 (M2-REVIEW section 6) and the roughly
sixty verified-but-unsurfaced findings of that pass (section 8).
