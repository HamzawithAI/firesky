# M1-REVIEW.md, external review rulings, 7 Sep 2026

Role: review of the amendment series and milestone M1, performed by a party that did not build them. Drop this file into the repo root. Proposals lock through the sign-off instruction in Hamza's prompt.

## 1. Verdict

Amendment series and M1 gate: MET, contingent items resolved below. Fixture changes were authorized and referenced, dependencies unchanged, ledgers provably append-only, and the adversarial pass caught real defects (symlink false negative, report-overwrite default, stale dist as oracle) that were fixed regression-test-first. Process behaved as designed.

## 2. Rulings

2.1. **F-033 and D-023: ACCEPTED, with expiry.** PLAN.md's M1 gate reads E1, E2, E3 green, so scenarios were never part of this gate and PENDING-outside-the-exit-code matches the plan's letter. The audit was still right to flag a self-made predicate change, so the acceptance carries a hard expiry: from the M3 gate onward, E5 results enter the exit code at their thresholds, and a PENDING scenario at M3 is a failure. Write the expiry into the runner and EVALS so it cannot be forgotten. D-023 locks on sign-off.

2.2. **F-030: RESOLVED by a dated grandfather rule, D-024 (proposed).** The `model:` requirement on flag entries applies only to entries dated 2026-09-08 or later. SCHEMA.md records the constant (MODEL_FIELD_SINCE: 2026-09-08) beside the rule. Grounds: the twenty flagged entries were lawfully written before the field existed, D-021 forbids touching them, and schema evolution by dated rule is deterministic, tiny, and a pattern every user of this kit will eventually need. Known limit, accepted for v0.1: a backdated entry could dodge the rule, and the git record makes that visible without the validator enforcing it. M2 unblocks.

2.3. **F-025: RESOLVED by derivation symmetry, D-025 (proposed).** Decisions already derive superseded-ness from pointers. Flags now derive resolution the same way: a flag is resolved if and only if a sign-off names it in scope, and the sign-off's prose carries the resolution note. The flag entry's `status:` and `resolution:` fields become advisory, correct at write time only, and the derived answer is authoritative everywhere (`dsk status`, render, validator reporting). Full grammar cleanup, removing the advisory fields and retiring INV-10, is explicitly deferred to v0.2. No fixture churn now.

2.4. **Preamble rule.** Full-file immutability stands, no region carve-outs in the git check. New SCHEMA note: ledger preambles must contain only timeless text, never state claims. The one false preamble line is acknowledged here as a historical artifact and left in place.

2.5. **F-032: ACCEPTED.** Implementation-level regressions live in unit tests. The frozen INV inventory is for schema conformance only. This distinction goes into EVALS as one sentence.

2.6. **The four findings dropped at cap: triage required.** The M0 pattern showed dropped findings can hide real ones. The next session lists all four and verifies or dismisses each with one line before starting M2 work.

## 3. Identity rewrite, authorized

Nothing has been pushed, so resetting the author identity of all existing commits to the HamzawithAI identity is authorized as a one-time act, valid only while the remote is empty. Conditions: the working tree and ledger contents must be byte-identical before and after, verified by checksum, and the next eval report must note that commit ids cited in earlier committed reports were remapped by this rewrite. The append-only proof is content-based and survives.

## 4. Standing confirmations

D-002 TypeScript and D-005 MIT remain as signed. D-006 (name) is still open unless Hamza states that firesky, the repo's name, is the product name.
