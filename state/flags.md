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

### F-016: A supersede transition is an in-place edit the append-only law forbids
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during the M0 review. SCHEMA.md section 2 puts the
supersede pointer on the superseded entry as status: superseded-by:D-###, but
reaching that state rewrites a line inside a committed entry, which law 5 and
EVALS.md section 4.3 ("fails on any non-append change") forbid. VAL-02 ships an
end state no append-only history can produce. Interpretation applied: the git
rule permits exactly one change to an existing decision, status: locked to
status: superseded-by:D-###, and nothing else. Closing this may instead move the
pointer onto the superseding entry, which is a schema change, not a fix.

### F-017: S3's pass criteria were mutually exclusive
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during the M0 review. S3 required D-001 to be
byte-identical after the run and also required its status line to transition,
so the hard 5-of-5 M3 gate could never pass. Fix applied in the same commit:
criterion 1 now excludes the status line. This is downstream of F-016 and must
be re-checked when F-016 closes. EVALS.md section 6's wording "original
untouched" is what generated the contradiction and is itself the ambiguity.

### F-018: VAL-03 carried an agent-raised flag with no model id
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during the M0 review. VAL-03 exists to demonstrate mixed
human and agent authorship, but its F-002 had raised-by: agent and no model
identifier anywhere, breaking P3 and R25 and contradicting the interpretation
already applied in F-013. Fix applied in the same commit: the model id is stated
in the entry prose, which is where F-013 puts it until the flag grammar gains a
field. The fixture stays schema-valid either way, which is the point: the gap is
invisible to the validator.

### F-019: ERR_PROVENANCE has no rule anywhere in SCHEMA.md
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during the M0 review. ERR_PROVENANCE appears only in the
section 6 code list; no field rule in section 2 says what a provenance block is
or when it is missing. INV-06 defines it by implication, by removing author and
model together. Interpretation applied: a decision entry missing author, or
missing model entirely, has no provenance block. Note that ERR_MODEL_ID cannot
also fire there, since it is conditioned on author being agent.

### F-020: Undefined which code fires when signoffs.md is edited in place
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during the M0 review. ERR_SIGNOFF_MUTATION and
ERR_INPLACE_EDIT both describe a non-append change to a ledger, and nothing
says which wins on state/signoffs.md. evals/expected/README.md asserted a
file-based split and attributed it to D-016, which contains no such rule; the
misattribution is corrected in the same commit. Interpretation applied and now
attributed to this flag: ERR_SIGNOFF_MUTATION owns signoffs.md,
ERR_INPLACE_EDIT owns the other three ledgers, so exactly one code fires.

### F-021: The expected-output predicate omitted the process exit code
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during the M0 review. SCHEMA.md section 5 says exit 0
only when ok is true, but the F-008 comparison predicate asserted only the JSON
body, so a validator that always exited 0 would pass E2. Interpretation applied:
the predicate now also asserts the process exit code, 0 for VAL and 1 for INV
per D-018. No fixture or expected output changed; the assertion was added.

### F-022: Coverage gaps the EVALS.md inventory forbids closing at M0
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during the M0 review. Four rules have no fixture and
cannot get one without changing the EVALS.md section 3 inventory, which D-014
clause 4 forbids the builder from doing unilaterally: no valid two-commit
fixture exercises the append-only pass case; no fixture sits at the five-line
ERR_RATIONALE boundary; the dropped criterion status appears nowhere; and
R19's "no orphan flags" rule has no code, no fixture and no mention in SCHEMA.md.
Nothing applied. These need Hamza's ruling before M1 builds against them.

### F-023: Transcription losses recorded rather than edited in place
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during the M0 review. Three details were dropped when
PROJECT.md was migrated: F-001's precondition "Report status before the build
starts"; D-002's reversal window "Override costs nothing if said before M0
ends"; and D-005's "License is trivially changeable any time before publish".
Law 5 forbids editing those committed entries in place, so the content is
restored here instead of there. D-002's window closes as this milestone ends,
which is the reason this flag is not cosmetic.

### F-024: Agent-authored decisions were recorded as locked without a sign-off
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
resolution: none

Raised by claude-opus-5 during the M0 review. D-015 through D-020 are owned by
hamza and marked locked, but no human signed off on them and signoffs.md is
empty, so the ledger asserts an approval that does not exist. Nothing applied:
law 5 forbids rewriting the status lines. The two legal exits are to append
sign-off entries to signoffs.md, or to supersede each with a proposed entry.
Both are Hamza's call, and P4 says the sign-off is the state transition.
