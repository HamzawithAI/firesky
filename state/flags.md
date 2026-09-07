# Flags

### F-001: July post status and its resonance numbers
status: open
date: 2026-09-07
owner: hamza
raised-by: human
resolution: none

The agreed gate evidence for productizing the framework. K1 and K2 govern
regardless of when this closes.

### F-002: Confirm build start against the 18 Sep MARSAD gate
status: resolved
date: 2026-09-07
owner: hamza
raised-by: human
resolution: Build starts now, before the 18 Sep gate, by Hamza's explicit call.

The trade is named rather than hidden: kit sessions compete directly with
MARSAD prep for the next eleven days.

### F-003: Metric numbers for the 8.3 and 8.4 measures
status: open
date: 2026-09-07
owner: hamza
raised-by: human
resolution: none

Proposed defaults live in EVALS.md section 10 and apply until replaced:
10 decisions plus 5 flags combined, 3 real validator catches, unprompted
second-project use by day 14, share at or above median plus 2 inbound.

### F-004: Confirm or resize the Tier M box
status: resolved
date: 2026-09-07
owner: hamza
raised-by: human
resolution: Closed by default: six sessions across three weeks, money cap $0.

### F-005: CLAUDE.md is on disk as CLAUDEs.md
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during M0. The file self-identifies as "# CLAUDE.md,
dsk build" and D-014 refers to it by that name, but Claude Code loads project
instructions by exact filename, so the trailing s made it dead weight.
Interpretation applied: renamed to CLAUDE.md, contents untouched. Reversible
with one git mv if the name was deliberate.

### F-006: INV fixtures do not map one to one onto error codes
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during M0. EVALS.md section 6 states the INV fixtures
map onto the codes one to one, but there are 16 fixtures and 15 codes:
ERR_OWNER must serve both INV-01 (decision missing owner) and INV-09 (flag
missing owner). Interpretation applied: the mapping is many-to-one, and the
invariant enforced instead is that every fixture yields exactly one code and
every code has at least one fixture.

### F-007: INV-16 could be ERR_SCOPE or ERR_LINK
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during M0. SCHEMA.md section 3 routes scope-member
resolution to ERR_LINK, yet ERR_SCOPE exists in the section 6 inventory with
no other fixture to claim it. Interpretation applied: INV-16 yields ERR_SCOPE,
because D-011 requires every code to ship its own fixture pair. If ERR_SCOPE is
meant for a different violation, name it and INV-16 moves to ERR_LINK.

### F-008: Expected-output comparison predicate is undefined
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during M0. EVALS.md requires expected validator output
per fixture but never says which fields are asserted; message text and line
semantics are both unspecified. Interpretation applied: the runner asserts
code, file, id, line and counts; message is informational and not compared;
line is the entry heading line, or 1 for whole-file errors like
ERR_SCHEMA_VERSION. Recorded in evals/expected/README.md.

### F-009: No storage form defined for the two-commit git fixtures
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during M0. EVALS.md section 4.3 requires INV-08 and
INV-14 to be two-commit fixtures, but a committed nested .git directory is not
workable inside this repo. Interpretation applied per D-016: base/ and head/
snapshots plus a manifest, materialised into a throwaway repo at run time.

### F-010: Grammar does not say whether non-entry lines are legal
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during M0. SCHEMA.md section 2 defines an entry but is
silent on lines that precede the first entry, so an empty or titled ledger has
undefined status. Interpretation applied: every ledger carries an H1 title and
the parser ignores all lines before the first "### " heading. This keeps empty
ledgers legal, which VAL-01 needs.

### F-011: PLAN.md M0.3 omits PROJECT.md section 13 from the migration
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during M0. PLAN.md M0.3 and CLAUDE.md build rule 2 name
sections 10 and 12, but section 13 carries D8 through D14, including D-008 which
freezes the schema and D-014 which defines this protocol. Interpretation
applied: section 13 migrated too, as the same ledger continued.

### F-012: PROJECT.md uses a decision status the schema does not define
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during M0. D6 is recorded as "open" in PROJECT.md
sections 10 and 12, but the decision vocabulary is proposed, locked, or
superseded-by:D-###, so "open" would raise ERR_STATUS. Interpretation applied:
D-006 migrates as proposed. Flags, not decisions, carry the open status.

### F-013: Flag entries have nowhere to record a model id
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during M0. P3 and R25 require the exact model
identifier on every agent-authored entry, but the flag grammar has only
raised-by, with no model field; the same gap exists for criteria entries.
Interpretation applied: raised-by: agent, with the model id stated in the entry
prose, which the grammar already permits. No field invented. Closing this may
mean adding model to the flag grammar, which is a schema change, not a fix.

### F-014: Criteria migration is wider than PLAN.md M0.3 states
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during M0. PLAN.md M0.3 names only D and F entries, but
signoffs.md and criteria.md must exist per SCHEMA.md section 1, and sign-off
scopes reference AC ids. Interpretation applied per D-014 clause 2: flag first,
then migrate AC1 to AC5 from PROJECT.md 8.5 into criteria.md. signoffs.md ships
titled and empty, since nothing has been signed off.

### F-015: ERR_STALE_REF would make every supersede chain invalid
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during M0. SCHEMA.md section 3 says a decision
referenced by any current entry must not itself be superseded, but a chain
requires the current decision to name its predecessor in supersedes, so VAL-02
could never validate. Interpretation applied: supersedes and superseded-by
targets are exempt; ERR_STALE_REF governs links and scope members only.
