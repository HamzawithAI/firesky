# M3-REVIEW-2.md, external review rulings, 8 September 2026

Role: ruling on the fix-and-rerun session, performed by a party that did not build it. Drop into the repo root. Proposals lock through the sign-off instruction in Hamza's prompt.

## 1. Verdict on the session

Commit series MET, eval-first held including the validator catching the session's own ordering omission, the evidence protocol was demonstrated adversarially at zero token cost, and stopping on the S3 red was correct. Refusing to sign F-052 into a scope the ruling did not name was also correct, and the reasoning, that a sign-off scope is the one append no later append can retract, is now part of this project's case law. The remaining red is real and correctly attributed to the instructions, not the agent.

## 2. F-066 ruling: D-035 (proposed), the same-entry supersedes exemption

2.1. ERR_STALE_REF gains one narrow exemption: a `links` member is exempt when the same entry's `supersedes` field names the same id. Grounds: the rule exists to catch superseded context treated as live, and a reference co-located with its own supersedes declaration is self-evidently historical, not misleading.
2.2. The superseding-entry examples in SKILL.md and the AGENTS snippet drop the redundant `links` line. `supersedes` alone carries the relationship, the link stays legal under 2.1 but is no longer taught as the default.
2.3. Fixtures: verify INV-04 and VAL-02 are unaffected. VAL-02 may be extended so the exempt pattern lives in the frozen inventory as a valid case. Eval-first order holds: the expectation expressing trial 4's pattern as valid goes red before the rule change lands.

## 3. Re-run scope, authorized

3.1. Re-grade all 35 committed artifacts of run 2026-09-08T14-46-24Z under the amended validator in grade-from-artifacts mode, zero new trials. Verdicts outside S3 must be unchanged, any change escalates to a full fresh run and stops for report.
3.2. Then five fresh S3 trials under the amended skill, sealed under the evidence protocol.
3.3. The combined report states the mixed provenance plainly: six scenarios re-graded from prior committed artifacts, one scenario re-run fresh, and why that is evidentially sufficient given 3.1's invariance check.

## 4. F-060 ruling: E6 enters the suite now

E6 is wired into the runner, the exit code, and CI. Absent or ungraded e6-results is a FAIL, not a PENDING, because E6 is due at this gate and a red suite while the gate is unmet is the truthful state. It clears when the results file lands and grades. The D-023 precedent does not apply, that pattern protected earlier gates from suites belonging to future milestones, and E6 belongs to this one.

## 5. Finding 12 residue: accepted as a known limit

Slash-command registration was verified manually in-session and end to end. No automated grader for interactive command expansion is built in v0.1. One sentence in EVALS records the limit.

## 6. F-052: closed

Its close call is structurally handled by D-033's ERR_DUP_KEY, implemented and green. Closure is authorized into the next sign-off scope alongside F-066.

## 7. Sequencing and the box

Hamza's E6 waits for this session's refreshed procedure, since the snippet's corrected example is part of what E6 tests. Remaining path: this fix session, then E6 at about fifteen minutes of human time, then M4, then M5, landing exactly on the eight-session box F-065 resized. Prompt B from the previous review remains valid unchanged for the post-E6 gate re-evaluation and M4.
