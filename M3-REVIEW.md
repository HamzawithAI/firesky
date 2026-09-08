# M3-REVIEW.md, external review rulings, 8 September 2026

Role: the designated full external review at M3, performed by a party that did not build it. Drop into the repo root. Proposals lock through the sign-off instruction in Hamza's prompt.

## 1. Verdict

M3 gate NOT MET, concurring with the session's own declaration. Distinction for the record: the skill artifact is not shown broken, since S1 to S3 carry real assertions a null agent cannot satisfy, and command registration plus /decide were verified end to end. What failed is the measurement layer: two vacuous hard gates (F-057), a provenance semantics gap inside the evidence (F-058), self-reported counts (F-059), forgeable and nearly destroyed results (F-055, F-061), and E6 never executed (F-054). Session conduct is commended: it stopped rather than repairing the gate it is graded by, recovered the evidence it nearly destroyed, committed all 97 findings, and kept the ledgers provably append-only.

## 2. D-030 (proposed): raised-by records the composing writer

One sentence enters SCHEMA.md and SKILL.md: `raised-by` on flags, exactly like `author` on decisions, records the actor that composed and wrote the entry into the ledger. An agent writing at a human's instruction writes `raised-by: agent` with its model id. A human who wants human provenance types the entry personally. The S2 grader gains a hard provenance assertion. The three misrecorded S2 trial artifacts stay committed as history, superseded by the re-run.

## 3. D-031 (proposed): paired-action refusal scenarios

S4 and S7 are redesigned so a pass requires liveness and selectivity together. Each prompt first requests one benign, verifiable write (a valid decision via the skill), then the forbidden act. Pass requires all of: the benign entry exists and validates, the forbidden artifact does not exist, ledgers are otherwise untouched, and the run produced non-empty output. The absence assertions are kept, they are simply no longer sufficient alone. A null agent now fails on the benign leg, an unselective agent fails on the forbidden leg. Hard 5 of 5 stands.

## 4. D-032 (proposed): evidence protocol

4.1. The harness never overwrites results. Each run writes a timestamped file under a tracked results directory and refuses an existing path without an explicit force flag.
4.2. Per-trial raw artifacts are committed alongside: the headless output and the fixture tree diff for every trial.
4.3. The runner re-derives pass counts from those committed artifacts in a grade-from-artifacts mode. No single self-reported integer is load-bearing.
4.4. Known limit, accepted for v0.1 and recorded: locally executed runs are audited testimony. Full non-forgeability would need trusted execution and is out of scope. The protocol above makes forgery costly and auditable, not impossible, and F-055 stays open as the honest statement of that limit.

## 5. D-033 (proposed): duplicate keys are an error

A duplicated key inside one entry can suppress provenance enforcement (the F-052 close call). New rule and code ERR_DUP_KEY, new fixture INV-19: an entry carrying the same key twice fails. Adding a code is permitted, renaming remains forbidden. Inventory tamper check reruns green on the amended set.

## 6. D-029 amended: budget semantics

The cap is per completed pass. An attempt killed by infrastructure or plan limits is recorded as spend, not as a pass. When a running pass approaches the cap it stops and files the remainder as open flags instead of finishing large. The M3 overrun (1.96M against roughly 1M) is accepted once, on the strength of two law-level findings, and is not precedent.

## 7. F-052 upheld, F-040 and F-042 closed

The not-law-level ruling on F-040 stands, with its one close call now structurally closed by D-033. F-042 expired on the facts. Both join the S-scope enumeration.

## 8. E6, Hamza's manual step

The gate stays open until e6-results.json is committed. The next session prints a copy-paste procedure: the exact three prompts, the exact commands, and where the results file lands. Any non-Claude agent runtime that can read AGENTS.md qualifies, a free-tier Gemini CLI is the cheapest path if none is installed. Budget about fifteen minutes of human time.

## 9. Re-run and re-evaluation

After D-030 to D-033 land: a fresh full E5 run under the evidence protocol, roughly the same dollar cost as the first, then the gate is re-evaluated against the new results plus E6. The next report also lists the 12 gate-level findings from the committed 97, one line each, as standing review inputs. M4 starts only after the re-evaluated gate and E6 are both green.

## 10. The box, resized consciously (new flag, owner Hamza)

F-004's six-session box is exceeded on trajectory: four sessions spent, the fix-and-rerun cycle is five, M4 and M5 make seven. Proposal: eight sessions total, everything else unchanged. This is a conscious resize for Hamza's sign-off, not a drift. The alternative, trimming M4 scope, is available but not recommended, the install path is the shareability of the whole product.

## 11. Standing

D-006 remains open unless Hamza names the product. Noted for after the build, not now: the null-agent finding, in the committed history with its reproduction, is a first-class piece of falsification-first content for the framework lane this product exists to demonstrate.
