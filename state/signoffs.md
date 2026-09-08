# Sign-offs

No sign-off has been appended yet. Sign-offs are append-only state transitions
(P4, D-009); nothing in this file is ever edited in place.

### S-001
actor: hamza
role: owner
date: 2026-09-07
scope: [D-002, D-005]

Confirms the two decisions M0-REVIEW.md sections 7.1 and 7.2 left reversible.
D-002 TypeScript, confirmed in Hamza's prompt of 7 Sep rather than by default,
which closes the reversal window F-023 recorded. D-005 MIT, confirmed and still
reversible until publish at M5. Both were already locked in this ledger; this
entry is the human approval the status line asserted and did not have.

### S-002
actor: hamza
role: owner
date: 2026-09-07
scope: [D-015, D-016, D-017, D-018, D-019, D-020, D-021, D-022]

The sign-off instructed by M0-REVIEW.md section 7.3, on Hamza's explicit
instruction of 7 Sep. Covers the six agent-authored M0 decisions F-024 found
locked without approval, and the two decisions this review adds. It also
approves the amendments made in this commit series under those decisions:
SCHEMA.md sections 2, 3 and 6, EVALS.md sections 2, 3, 4 and 6, S3's pass
condition, the runner's derived inventory, and the fixture set moving to
VAL-01 to VAL-05 and INV-01 to INV-17. Nothing in any ledger was edited in
place to produce this state.

### S-003
actor: hamza
role: reviewer
date: 2026-09-07
scope: [F-005, F-006, F-007, F-008, F-009, F-010, F-011, F-012, F-013, F-014, F-015, F-016, F-017, F-018, F-019, F-020, F-021, F-022, F-024]

Closes every flag the D14.3 external review ruled on: section 4.1 accepts
F-005, F-008, F-009, F-010, F-011, F-012, F-014, F-020 and F-021 as
interpreted; 4.2 F-006; 4.3 F-007; 4.4 F-013 and F-018; 4.5 F-019; 4.6 F-015,
F-016 and F-017 by D-021; 4.7 F-022 by D-022; 4.8 upholds F-024, which these
sign-off entries satisfy. Those flags keep their textual status: open, because
D-021 forbids editing a committed ledger line and this scope is the closure
(F-025). Deliberately not closed and still owned by Hamza: F-001, F-003 and
F-023, which the review did not rule on, and F-025 to F-028, raised after it.

### S-004
actor: hamza
role: owner
date: 2026-09-08
scope: [D-023, D-024, D-025]

Hamza's explicit authorization of 8 Sep, in the prompt that instructed this
session to apply M1-REVIEW.md. It locks the three decisions the M1 external
review left proposed: D-023, the eval gate counting only suites whose harness
exists, accepted under M1-REVIEW section 2.1 with the hard M3 expiry now written
into EVALS.md section 6 and enforced in evals/runner.mjs; D-024, the dated
grandfather that resolves F-030; and D-025, flag resolution by derivation, which
resolves F-025. All three keep the textual status proposed, because D-021 forbids
editing a committed ledger line, and this entry is the state transition that
locks them (P4, law 4, F-025). Also approves the amendments made under them in
this commit series: SCHEMA.md sections 0 and 2, EVALS.md sections 1 and 6, the
runner's E5 gate, and the INV-17 date change recorded in F-034.

Deliberately not covered, because the authorization named these three decisions
and nothing else: the flags the review resolved rather than this sign-off, which
are F-025, F-029, F-030, F-032 and F-033, and every flag raised after it, F-034
to F-043. Under D-025 they therefore derive as open. Closing them is one further
sign-off and it is Hamza's to give, not this session's to assume (F-043).

### S-005
actor: hamza
role: reviewer
date: 2026-09-08
scope: [F-025, F-029, F-030, F-032, F-033, F-036, F-043]

The closure sign-off M2-REVIEW.md section 5 authorizes, on Hamza's explicit
instruction of 8 Sep, with the scope enumerated from the review files themselves
and printed in full before this entry was appended. Closes every flag whose
ruling in M0-REVIEW.md, M1-REVIEW.md or M2-REVIEW.md disposes of it and which no
earlier sign-off already names: F-025 by M1-REVIEW 2.3, F-030 by 2.2, F-032 by
2.5, F-033 by 2.1, F-029 by 2.4, and F-036 by M2-REVIEW section 2, which this
commit series applied in full before this entry existed, as section 5 requires.
F-043 is closed by this entry being the remedy it asked for.

Not covered, deliberately, each recorded in F-051: F-037, whose sixteenth-code
question section 3 does not answer; F-047, deferred with a trigger until M5;
F-040 and F-042, held by section 6 as M3 review inputs; F-002 and F-004, closed
by Hamza in PROJECT.md section 12 and by no review file; and the builder-raised
flags no external party has ruled on. Every flag here keeps its textual
status: open, because D-021 forbids editing a committed ledger line and this
scope is the closure (D-025).

### S-006
actor: hamza
role: owner
date: 2026-09-08
scope: [D-026, D-027, D-028, D-029]

Hamza's explicit authorization of 8 Sep, in the prompt instructing this session
to apply M2-REVIEW.md, which names D-026 through D-029. It locks the four
decisions the M2 external review left proposed: D-026, the committer reset
alongside the authorized author reset, accepted in M2-REVIEW section 1; D-027,
criteria resolution by derivation, from section 2.4; D-028, sign-offs are
attestations of a moment, from section 2, which resolves F-036; and D-029, the
fifteen-agent cap on the internal adversarial pass, from section 7.

All four keep the textual status proposed, because D-021 forbids editing a
committed ledger line, and this entry is the state transition that locks them
(P4, law 4, F-025). It also approves the amendments made under them in this
commit series: SCHEMA.md sections 0, 2 and 3, EVALS.md sections 1, 2, 3 and 4.3,
the INV-18 fixture and the three E4 expected outputs recorded in F-048 and
F-049, PLAN.md's M2 row and review-gates section, and the narrowed
ERR_STALE_REF with the dsk status surface section 2.2 requires.

### S-007
actor: hamza
role: owner
date: 2026-09-08
scope: [D-030, D-031, D-032, D-033, D-034, F-065]

Hamza's explicit authorization of 8 Sep, in the prompt instructing this session
to apply M3-REVIEW.md: "I explicitly authorize sign-offs with actor hamza
covering D-030 through D-033, the D-029 amendment, and the eight-session box
resize." It locks the four decisions the M3 external review left proposed —
D-030, `raised-by` records the composing writer, from section 2; D-031,
paired-action refusal scenarios, from section 3; D-032, the evidence protocol,
from section 4; D-033, duplicate keys are an error, from section 5 — plus D-034,
which is the D-029 amendment of section 6 and carries it the only way this
schema allows, by superseding rather than editing. It closes F-065, the
eight-session box resize of section 10, which the review asked to be a flag
Hamza signs rather than a number that quietly moves.

All five decisions keep the textual status proposed, because D-021 forbids
editing a committed ledger line, and this entry is the state transition that
locks them (P4, law 4, F-025). It also approves the amendments made under them
in this commit series: SCHEMA.md sections 0, 2 and 6, including the sixteenth
error code and the restated freeze; EVALS.md sections 2, 3 and 6, including the
evidence protocol and the threshold cross-check; the INV-19 fixture and its
expected output, disclosed in F-063 under D-014 clause 4; the paired-action
rewrites of S4 and S7 and the provenance clause on S2; and PLAN.md's box and
audit-budget paragraphs.

Deliberately not covered, because the authorization named these and nothing
else: F-062, the snippet extension this session made beyond the review's
enumerated sections, which stays open for Hamza to accept or revert; F-063 and
F-064, this session's own disclosures; F-055, which section 4.4 requires to
stay open; and F-054 and F-060, which E6 governs and no work here touches.

### S-008
actor: hamza
role: reviewer
date: 2026-09-08
scope: [F-040, F-042]

The closure the M3 external review's section 7 authorizes, on Hamza's explicit
instruction of 8 Sep to apply "closures per section 7". Section 7 reads
"F-052 upheld, F-040 and F-042 closed", and names those two as the pair that
joins the S-scope enumeration: the not-law-level ruling on F-040 stands, with
its one close call now structurally closed by D-033, and F-042 expired on the
facts. Both keep their textual status open, because D-021 forbids editing a
committed ledger line and this scope is the closure (D-025).

F-052 is deliberately NOT in this scope, and the omission is the conservative
reading rather than an oversight. Section 7 says it is upheld, which is a
finding that the flag was rightly raised, and lists only F-040 and F-042 as
closed. Its substance is answered — ERR_DUP_KEY and INV-19 close the close call
it recorded — but a sign-off scope is permanent and cannot be un-named, so
naming a flag the ruling did not name is the one mistake here that no later
append could correct. It stays open, and one line from Hamza closes it.

### S-009
actor: hamza
role: owner
date: 2026-09-08
scope: [D-035]

Hamza's explicit authorization of 8 Sep, in the prompt instructing this session
to apply M3-REVIEW-2.md: "I explicitly authorize sign-offs with actor hamza
covering D-035 and the closures of F-052 and F-066." This entry is the decision
half; S-010 is the closure half, split by role as S-007 and S-008 were.

It locks D-035, the same-entry supersedes exemption to ERR_STALE_REF, which the
second M3 external review left proposed in its section 2.1. The decision keeps
the textual status proposed, because D-021 forbids editing a committed ledger
line, and this entry is the state transition that locks it (P4, law 4, F-025).

It also approves the amendments made under it in this commit series: SCHEMA.md
section 0 amendment 17 and section 3 clause 4; EVALS.md's fifth-amendment
paragraph, the VAL-02 sentence in section 3, the finding-12 known limit in
section 6 and the E6 gating and limit paragraphs in section 7; the VAL-02
extension and its expected file, disclosed in F-067; the E6 grader hardening
disclosed in F-068; and the supersede example dropping its redundant `links`
line on all four shipped surfaces.

Deliberately not covered, because the authorization named D-035 and two closures
and nothing else: F-067, F-068 and every flag this session raises after them,
which stay open for Hamza; F-054 and F-060, which E6 governs and which this
series wires up rather than satisfies; F-055 and F-064, which their own rulings
require to stay open; and F-065, already closed by S-007.

### S-010
actor: hamza
role: reviewer
date: 2026-09-08
scope: [F-052, F-066]

The closures Hamza's authorization of 8 Sep names, in the same sentence as
D-035, and which M3-REVIEW-2.md sections 6 and 2 rule on.

F-052, closed under section 6: "Its close call is structurally handled by
D-033's ERR_DUP_KEY, implemented and green. Closure is authorized into the next
sign-off scope alongside F-066." This is that scope. S-008 deliberately left it
open because M3-REVIEW.md section 7 said only "upheld" and a sign-off scope
cannot be un-named once appended; the ruling that closes it arrived one review
later, and the conservative reading cost exactly one line.

F-066, closed under section 2. The flag recorded that S3 failed a hard 5-of-5
gate because the kit's own supersede example was invalid under its own schema.
D-035 makes the pattern legal, the example on all four surfaces stops teaching
the redundant link, VAL-02 carries the pattern as a frozen valid case, and four
unit tests now lift the example out of each shipped surface and validate it, so
the class of defect is graded rather than merely fixed.

Both keep their textual status open, because D-021 forbids editing a committed
ledger line and this scope is the closure (D-025).
