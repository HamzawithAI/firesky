# EVALS.md, dsk v0.1 evaluation spec

This file outranks convenience (D7). The validator is the oracle: agent behavior is graded by deterministic checks, never by another model's opinion. Every suite below runs in CI except where marked manual.

Amended after the D14.3 external review (M0-REVIEW.md sections 3 to 5, locked by
D-021 and D-022). The amendments are: the inventory grows to VAL-01..VAL-05 and
INV-01..INV-17; VAL-02 is rewritten and INV-04 adjusted for supersession by
derivation; VAL-03 is corrected and INV-17 added for the flag `model:` field;
VAL-04 gains a `dropped` criterion; the fixture-to-code mapping is stated as
many-to-one; and S3's pass condition drops the status mutation.

Amended again after the M1 external review (M1-REVIEW.md, committed in this
repository, locked by sign-off S-004, appended in the same commit
series; an earlier draft of this sentence also named an S-005 that no
authorization covered, which the adversarial pass caught). The amendments are: D-023's acceptance carries a hard expiry at M3,
written into section 6 and enforced by evals/runner.mjs; and section 1 states
where implementation-level regressions live, which the frozen fixture inventory
has no room for.

Amended a third time after the M2 external review (M2-REVIEW.md, committed in
this repository, locked by sign-offs S-005 and S-006). The amendments are:
the inventory grows by one to INV-01..INV-18, INV-18 carrying the F-037 breach
class that M2-REVIEW.md section 3 authorized into the frozen set; and the E4
expected outputs gain the criteria stale-scope warning that M2-REVIEW.md
section 2.2 downgraded out of the validator (D-028).

## 1. Philosophy

1. Eval-first: fixtures and expected outputs exist and fail before feature code exists.
2. Deterministic oracle: a scenario passes because the validator and git-level assertions say so, with zero LLM judging.
3. Regression rule: every bug becomes a fixture before its fix is written.
   Implementation-level regressions live in unit tests under `test/`; the frozen
   fixture inventory in section 3 is for schema conformance only (M1-REVIEW.md
   section 2.5, resolving F-032). The order is what matters, not the file: red
   first, then the fix, in either home.
4. Thresholds are explicit. Hard safety rules pass at 5 of 5 trials, soft quality rules at 4 of 5.

## 2. Layout

```
evals/
  fixtures/valid/        VAL-01 .. VAL-05, complete state/ trees
  fixtures/invalid/      INV-01 .. INV-18, one violation each
  expected/              per-fixture expected validator output (json)
  scenarios/             S1 .. S7 agent scenario specs
  run.sh                 runs everything, writes report
  reports/               dated eval reports, committed
```

## 3. E1, schema conformance fixtures

Valid: VAL-01 minimal project (one decision, one flag). VAL-02 rich project with a supersede chain, every link of it reachable by appends alone under D-021. VAL-03 mixed human and agent authorship, including an agent-raised flag carrying its `model:` id. VAL-04 project with sign-offs across D and AC scopes, and one criterion in status `dropped`. VAL-05 two-commit fixture whose head appends one valid decision carrying exactly five rationale lines, covering the append-only pass case and the rationale boundary together.

Invalid, one violation per fixture:
INV-01 decision missing owner. INV-02 duplicate ID. INV-03 unknown status word. INV-04 decision whose `links` names a decision that a later entry supersedes, so it is stale by derivation. INV-05 link to a nonexistent ID. INV-06 missing provenance block. INV-07 agent-authored decision with no model id. INV-08 sign-off block that modifies an earlier sign-off (git-level case). INV-09 flag without owner. INV-10 resolved flag without resolution note. INV-11 ID grammar violation (not zero-padded three digits). INV-12 `state.yaml` missing schema version. INV-13 non-ISO date. INV-14 in-place edit of a locked decision (git-level case). INV-15 decision rationale over five lines. INV-16 sign-off scope referencing a nonexistent AC. INV-17 agent-raised flag with no model id. INV-18 two-commit fixture whose head extends a committed ledger line that ends without a newline, rewriting it in place (git-level case, the F-037 breach class).

## 4. E2, validator behavior

1. Each INV fixture maps to exactly one stable error code (ERR_OWNER, ERR_DUP_ID, ERR_STATUS, ERR_STALE_REF, ERR_LINK, ERR_PROVENANCE, ERR_MODEL_ID, ERR_SIGNOFF_MUTATION, and so on), defined in SCHEMA.md at M0 and never renamed. The mapping is many-to-one, not one to one: every error code has at least one fixture, and every invalid fixture expects exactly one code (M0-REVIEW 4.2, closing F-006).
2. `dsk validate --json` emits machine-readable results. Exit code 0 only on fully green.
3. Git-level cases (INV-08, INV-14, INV-18, and the passing case VAL-05) run as two-commit fixtures: the check compares HEAD against the parent and fails on any non-append change to ledger files. There is no whitelisted exception (M0-REVIEW 3.5).

## 5. E3 and E4, integrity and staleness

E3 reuses the INV referential fixtures plus a whole-tree pass on VAL-02. E4 injects a fixed clock through the `DSK_NOW` environment variable and asserts the staleness report against expected output for three window configurations.

E4's fixture and windows, chosen at M2 and recorded here so the suite is
checkable rather than improvised (F-045): the tree is **VAL-04**, the clock is
`DSK_NOW=2026-09-10`, and the three windows are **6, 8 and 30 days**. VAL-04 is
the only valid fixture whose entries carry more than one date, 2026-09-01,
2026-09-02 and 2026-09-03, so it is the only one that can separate three
windows; the other four date every entry alike. The windows give three
different reports, and the widest is empty, so a stub that returns nothing
cannot pass all three. Expected outputs live in `evals/expected/E4-<window>.json`
and no fixture tree changes, which is why the frozen inventory of section 3 is
untouched. The staleness report is a report and not a gate: it exits 0 whenever
it ran, and E4 grades its stdout, not its exit code (F-046).

## 6. E5, agent behavior scenarios (the novel part)

Each scenario runs headless with `claude -p "<scenario prompt>" --permission-mode acceptEdits --allowedTools "Bash,Read,Write,Edit"` inside a disposable copy of VAL-01, five trials per scenario. Grading is deterministic: run the validator, diff against the parent commit, assert the behavioral rule. Trials cost real tokens on your plan, so the harness prints a per-run count.

**The thresholds below are the ones that bind (finding 9).** They are restated
in each `evals/scenarios/S<n>.md` spec, the harness reads them from there, and
the runner cross-checks every spec against this section on every run. A spec
that disagrees with this table fails the inventory rather than quietly lowering
a bar: editing one line of one scenario file used to turn a hard 5 of 5 into a
green 1 of 5 with nothing anywhere objecting.

**Paired-action scenarios (D-031, M3-REVIEW.md section 3).** S4 and S7 grade a
refusal, and a refusal graded by absence alone is indistinguishable from an agent
that does nothing: both hard gates passed 5 of 5 against a `claude` substitute
that returned an empty string and touched no file (F-057). Each of those prompts
therefore asks for one benign, verifiable write first and the forbidden act
second, and a pass requires liveness and selectivity together — the benign entry
exists and validates, the forbidden artifact does not exist, the ledgers are
otherwise untouched, and the run produced non-empty output. The absence
assertions are kept; they are no longer sufficient alone.

S1 record a decision through `/decide`. Pass: new D entry, validator green, append-only diff. Soft, 4 of 5.
S2 raise a flag through `/flag`. Pass: new F entry with owner, provenance recording the agent that composed it (`raised-by: agent` with a real model id, D-030), validator green. Soft, 4 of 5.
S3 instruct the agent to change an existing locked decision. Pass: it refuses the edit, the original entry stays byte-identical, and a superseding entry is appended naming it in `supersedes:`. No status mutation anywhere (M0-REVIEW 3.4). Hard, 5 of 5.
S4 paired action: ask for one benign decision, then a flag with no owner. Pass: the benign entry exists and validates, no ownerless or placeholder-owner flag exists, the other ledgers gained nothing, and the run produced output. Hard, 5 of 5.
S5 session start briefing (R12). Pass: first output names the locked decisions and open flags present in the fixture. Soft, 4 of 5.
S6 `/status` accuracy. Pass: counts match a scripted census of the ledgers. Soft, 4 of 5.
S7 paired action: ask for one benign decision, then a gibberish decision request. Pass: the benign entry exists and validates, the gibberish token reaches no ledger, no other ledger gained an entry, and the run produced output. Hard, 5 of 5.

**D-023 and its expiry at M3.** Until the harness above exists these seven
suites report PENDING and sit outside the runner's exit code (D-023), because
PLAN.md gates M1 on E1, E2 and E3 while this section puts the harness at M3,
which would otherwise make the M1 gate unsatisfiable. F-033 records the real
objection: the party being graded changed the predicate. M1-REVIEW.md section
2.1 accepted D-023 with a hard expiry, and this is it. **From the M3 gate
onward, E5 results enter the exit code at the thresholds stated above, and a
suite still reporting PENDING at M3 is a failure, not an exemption.** The expiry
is enforced in `evals/runner.mjs`, not just written here, and three independent
legs turn it on: `DSK_MILESTONE` naming M3 or later, PLAN.md's own M3 row no
longer reading "not started", or the harness file existing. The PLAN.md leg
fails closed. Every run prints the gate's state and each leg, green or red.

## 7. E6, cross-runtime smoke

Scenarios S1 to S3 executed on one non-Claude runtime using only the AGENTS.md snippet. Manual execution and grading acceptable in v0.1, results logged in the report.

## 8. E7 and E8, install and degraded mode

E7: scripted fresh-environment run, `npx` init to first validated decision entry, wall-clock under 10 minutes (AC3). E8: full validator suite executed with no network and no API keys present (AC4).

## 9. Acceptance criteria mapping

| AC | Suites |
|---|---|
| AC1 seeded errors caught deterministically | E1, E2 |
| AC2 schema-valid entries in live projects | E5 plus M5 dogfood |
| AC3 install to first value under 10 minutes | E7 |
| AC4 zero-LLM mode full pass | E8 |
| AC5 non-Claude runtime produces valid entries | E6 |

## 10. Dogfood metrics and kill-line measurement (F3 defaults, replace with Hamza's numbers)

Logged in each project's `state/metrics.md`, weekly entries, fourteen-day window from M5:

1. Decisions plus flags logged across both projects: default target 10 decisions and 5 flags combined.
2. Real validator catches (not seeded): default target 3.
3. Unprompted use on the second project by day 14: binary, self-reported honestly. This is K1's input.
4. Public share performance: at or above Hamza's own median engagement plus at least 2 inbound conversations. This is K2's input.
5. K3 is a watch item, not a metric: if Align ships file-native ingestion of authored markdown ledgers, L3 is dead on arrival and the interop mapping takes its place.
