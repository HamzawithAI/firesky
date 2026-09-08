# M2-REVIEW.md, external review rulings, 8 September 2026

Role: review of the pre-M2 series and milestone M2, performed by a party that did not build them. Drop into the repo root. Proposals lock through the sign-off instruction in Hamza's prompt.

## 1. Verdict

Pre-M2 series and M2: MET, with the merge-gating clause consciously deferred (section 4). Identity rewrite verified byte-identical and pushed, F-030 cleared, D-023 expiry wired with three legs each proven to flip the run red, eval-first held through E4, and the session refused to exceed its sign-off authorization. D-026 (committer reset alongside author) is accepted, the deviation was flagged and right.

## 2. F-036 ruling: sign-offs are attestations of a moment (D-028 proposed)

The flaw: ERR_STALE_REF fires on any scope member that is superseded, sign-offs are immutable and cannot be superseded, so superseding any signed decision makes the tree permanently invalid. The flaw is in the review's own earlier redefinition, not in the build.

Ruling, four parts:
2.1. Sign-off `scope` members are exempt from ERR_STALE_REF forever. A sign-off records approval of an entry as it stood at that time, and a later supersession does not falsify history. ERR_SCOPE still applies to sign-offs in full: every scoped id must exist.
2.2. Criteria `scope` members referencing a superseded decision stop being a validator error and become a staleness-report warning, surfaced by `dsk status` and `render`. The signal survives, the brick does not.
2.3. ERR_STALE_REF remains a hard error exactly where it misleads: `links` members on current, non-superseded entries. INV-04 must exercise that case through a `links` field on a current entry, adjust the fixture if it does not.
2.4. **D-027 (proposed): derivation extends to criteria.** A criterion is met if and only if a sign-off names it in scope. The written `status:` field on criteria becomes advisory exactly as D-025 made flag status advisory. `dropped` stays advisory-only in v0.1, and the full grammar cleanup joins the existing v0.2 bucket.

E4 expected outputs and any touched fixtures update under this ruling, each amendment commit referencing this file and a flag.

## 3. INV-18 authorized

The F-037 breach class, an in-place extension of a committed line hidden by a missing trailing newline, enters the frozen inventory as INV-18: a two-commit fixture whose head extends a committed ledger line without a newline boundary, expecting ERR_INPLACE_EDIT. Law-level breaches get fixtures, not only unit tests. The inventory tamper check reruns green on the amended set.

## 4. F-047 ruling: merge gating deferred with a trigger, not dropped

Enforcing a required status check today would push the build into a pull-request workflow mid-stream or block direct pushes. Ruling: the strict clause is deferred until the repo goes public at M5, at which point the workflow switches to branches plus pull requests, the eval check becomes required, and Hamza's ten-minute review happens on the pull request itself. PLAN.md's M2 row gains one line recording the deferral and its trigger. Until then, CI on every push plus committed reports carries the gate in spirit.

## 5. F-043 ruling: closure sign-off authorized by enumeration

S-005 is authorized with scope enumerated from the review files themselves: every flag whose ruling in M0-REVIEW.md, M1-REVIEW.md, or this file reads accepted, resolved, or closed. The session derives the list from those documents, prints it before appending, and signs nothing that lacks a written ruling. F-036-family flags join the scope only after section 2 is applied.

## 6. F-040 and F-042: print and hold

Their content was not visible to this review. The next session prints both verbatim before any other work. If either is law-level or would change a gate already claimed, stop and report before M3 work starts. Otherwise both are carried as standing inputs to the M3 external review.

## 7. Audit budget, hard cap (D-029 proposed)

From M3 onward the internal adversarial pass is capped at fifteen agents, one pass, roughly one million tokens, and any finding it cannot verify inside the cap is written down as an open flag rather than re-derived by fan-out. The 122-agent pass was driven by this review's own triage wording, it caught F-037, and it is still not the pattern: depth beyond the cap is the external reviews' job. The full artifacts of the 122-agent pass stay committed and are declared inputs to the M3 external review.

## 8. Standing items

The roughly sixty verified-but-unsurfaced findings from the large pass are M3 review inputs, not silent history. D-006 remains open unless Hamza names the product. The M3 gate activates the D-023 expiry: E5 enters the exit code at its thresholds, and E5's thirty-five headless runs are a designed, budgeted cost.
