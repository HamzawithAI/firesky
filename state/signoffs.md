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
