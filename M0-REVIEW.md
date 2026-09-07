# M0-REVIEW.md, external review rulings, 7 Sep 2026

Role: the D14.3 external review, performed by a party that did not build M0. Drop this file into the repo root. Proposals below lock through Hamza's sign-off instruction in section 7.

## 1. Gate verdict

M0 gate MET. Eval-first held (zero validator code written), SCHEMA promoted byte-identical, flag-don't-guess worked as designed, the inventory became a proven tamper check (D-020). Proceed to M1 after this file's amendments are applied and signed.

## 2. Attribution, for the record

Findings tracing to the frozen spec, not the build: F-006, F-007, F-011, F-012, F-013, F-015, F-016, F-019, and most of F-022. Findings that were build defects, caught by its own audit and fixed or held: F-017 as written in S3.md, F-018, F-020, F-021. The review system caught the spec author. That is it working, not failing.

## 3. The design ruling: supersession by derivation (resolves F-015, F-016, F-017)

**D-021 (proposed, locks on sign-off).** The decision status vocabulary shrinks to `proposed` and `locked`. `superseded-by:` is removed from the vocabulary entirely. An entry is superseded if and only if a later entry names it in its `supersedes:` field. Ledgers are pure append-only with zero sanctioned mutations. `dsk status`, `render`, and the validator derive current-ness from the pointers.

Mandatory consequences:
3.1. ERR_STATUS: any status word outside `proposed` or `locked` errors. INV-03 unchanged.
3.2. ERR_STALE_REF redefined: applies to `links` and `scope` members only, never to `supersedes`, and superseded-ness is computed by derivation. INV-04 adjusted to match.
3.3. VAL-02 rewritten: D-002 locked, D-003 locked with `supersedes: D-002`, the derived view reports D-002 superseded. Every valid chain is now producible by appends alone.
3.4. S3 pass condition: the original entry stays byte-identical and a superseding entry is appended. No status mutation anywhere. The hard 5-of-5 gate is now satisfiable.
3.5. The git-level check simplifies: any change to committed ledger lines is a violation, no whitelist, no exceptions.

Alternative considered and rejected: whitelisting a single sanctioned status mutation on supersede. Rejected because it complicates the append-only invariant, reopens the tamper surface D-020 just closed, and contradicts the kit's own thesis that state is derived from an append-only record.

## 4. Rulings on the open flags

4.1. Accept as interpreted and close: F-005, F-008 (including F-021's exit-code addition to the predicate), F-009, F-010, F-011, F-012, F-014, F-020, F-021.
4.2. F-006 accepted. EVALS wording amended from "one to one" to: every error code has at least one fixture, and every invalid fixture expects exactly one code.
4.3. F-007 accepted. ERR_LINK governs `links` fields, ERR_SCOPE governs `scope` fields.
4.4. F-013 and F-018 accepted. The flag grammar gains a `model:` field with the same rule as decisions: required and non-none when `raised-by` is agent, enforced by ERR_MODEL_ID. VAL-03 corrected. New INV-17 covers an agent-raised flag without a model id.
4.5. F-019 resolved. ERR_PROVENANCE is defined as: `author` missing or invalid, or `date` absent, on any entry. ERR_DATE remains: date present but not ISO format.
4.6. F-015, F-016, F-017 resolved by D-021, section 3.
4.7. F-022 resolved by inventory amendment, section 5, plus **D-022 (proposed):** R19's "no orphan flags" clause is cut for v0.1 as unenforceable under the current grammar. No new error code. An optional `links` field on flags is deferred, P7 governs.
4.8. F-024 valid and upheld. Sign-off entries are appended only on Hamza's explicit instruction, section 7.3 provides it. The agent never signs on its own.

## 5. EVALS inventory after amendment

Valid fixtures: VAL-01 to VAL-05. VAL-02 rewritten per 3.3. VAL-03 corrected per 4.4. VAL-04 extended with one criterion in status `dropped`. VAL-05 is new: a two-commit fixture whose head appends one valid decision carrying exactly five rationale lines, covering the append-only pass case and the rationale boundary in a single fixture.
Invalid fixtures: INV-01 to INV-17, with INV-04 adjusted per 3.2 and INV-17 new per 4.4.
Error codes: fifteen, unchanged in count. ERR_OWNER and ERR_MODEL_ID each carry two fixtures.
Expected outputs updated to match. The D-020 tamper check must rerun green on the amended set before any validator code is written. Every amendment commit references this file and the flag it closes, satisfying the fixture-change rule.

## 6. Process calibration from M1 onward

The eighteen-agent internal audit earned its keep at M0 and is not the standing pattern. From M1: deterministic gates plus the ten-minute human checklist per milestone, internal audit optional and capped at one adversarial pass, and the full external review at M3 as planned. Reason: the audit's own cap dropped forty findings unverified, which says swarm size was buying noise past a point, and the research under this product found deterministic gates outperform LLM judges.

## 7. Hamza's confirmations

7.1. D-002 TypeScript: confirmed by default at M0 close unless overridden in the next prompt.
7.2. D-005 MIT: stands, reversible until publish.
7.3. Sign-off instruction: the next session appends sign-off entries with `actor: hamza` covering D-015 through D-022 and this review's amendments, on the explicit instruction contained in Hamza's prompt.
7.4. Optional but recommended: create a private remote and push now. Six commits with no backup is unnecessary risk.
