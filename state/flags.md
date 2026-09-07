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

### F-025: Append-only leaves no in-ledger transition for any status field
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 applying M0-REVIEW.md. D-021 clause 3.5 forbids any
change to a committed ledger line, with no whitelist and no exception, so no
entry's status can ever move afterwards: a decision cannot go proposed to
locked, a flag cannot go open to resolved, a criterion cannot go open to met or
dropped. The status word is now write-once at creation. Interpretation applied:
the appended sign-off naming the entry in its scope is the state transition
(P4, law 4), and current-ness is derived from sign-offs the way supersession is
derived from pointers. Two visible consequences, both deliberate: F-005 to
F-024 in this file stay textually open while S-003 closes them, and D-021 and
D-022 are born locked because nothing could lock them later. Closing this may
add a supersedes field to flags and criteria, which is a schema change, not a
fix, and it is Hamza's call, not the builder's.

### F-026: A dangling supersedes target is ungoverned
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 applying M0-REVIEW.md. Section 4.3 gives ERR_LINK the
links field and ERR_SCOPE the scope field, and 3.2 removes supersedes from
ERR_STALE_REF, which leaves an entry carrying supersedes: D-999 pointing at
nothing with no code to catch it. The pre-amendment SCHEMA.md covered this with
"a superseded-by target must exist", and that sentence is gone with the status
word it described. Interpretation applied: no code fires on it in v0.1. Minting
one would need a sixteenth error code and its own fixture pair (D-011), and
M0-REVIEW.md section 5 fixes the count at fifteen codes and INV-01 to INV-17.

### F-027: ERR_PROVENANCE's "on any entry" would fire on criteria and sign-offs
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 applying M0-REVIEW.md. Section 4.5 defines
ERR_PROVENANCE as author missing or invalid, or date absent, "on any entry",
but a criterion entry carries neither author nor date and a sign-off entry
carries no author, so read literally every criterion and every sign-off in
every green fixture would fail. Interpretation applied: the rule runs per entry
type against the fields that type's grammar defines, author and date on
decisions, raised-by and date on flags, date on sign-offs, and criteria are out
of scope entirely. Recorded in SCHEMA.md section 2 and in
evals/expected/README.md so the M1 validator is built against it.

### F-028: Two milestones in one session, against D-014 clause 1
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 at the start of this session. D-014 clause 1 requires
one milestone per session in a fresh session, and this session applies the M0
review amendments and then builds M1. Hamza instructed both in a single prompt,
so this is an authorized deviation rather than drift, and D-014 clause 2
requires it be flagged before execution leaves the plan. Nothing else in D-014
is relaxed: the M1 gate stays the eval runner, no fixture, expected output or
threshold is edited to make a run pass, and no dependency is added without a D
entry. M0-REVIEW.md section 6 also applies from M1: deterministic gates plus the
human checklist, with internal audit capped at one adversarial pass.

### F-029: Undefined whether the git check protects ledger preamble lines
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 while appending S-001 to S-003. F-010 established that
the parser ignores everything before the first "### " heading, but D-021 clause
3.5 protects "committed ledger lines" without saying whether the preamble is
one. The two readings differ in practice, and this repo just produced the
evidence: state/signoffs.md opens with "No sign-off has been appended yet",
which three appended sign-offs have made false, and which no one may correct
under the strict reading. Interpretation applied for M1: the git-level check
protects every line of a ledger file, preamble included, because that is the
reading with no tamper surface left in it (D-020). The stale sentence stays as
the honest artifact of the rule. Loosening this later costs one commit;
tightening it later would retroactively excuse edits already made.

### F-030: The amended flag grammar makes this repo's own ledger invalid
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 at M1, and it is a real validator catch rather than a
seeded one: dsk validate on this repository reports twenty ERR_MODEL_ID errors
and nothing else. F-005 through F-024 all carry raised-by: agent and were
written before M0-REVIEW.md section 4.4 added model: to the flag grammar, so
the amendment invalidated them retroactively. D-021 forbids adding the missing
line, and flags have no supersedes field to append a correction through
(F-025), so there is no legal in-schema fix available to the builder. Nothing
applied. This does not block M1, whose gate is E1, E2 and E3, but it does block
M2, whose gate is the Action validating this repository. Three exits, all
Hamza's call: give flags a supersedes field, version the grammar so a rule
applies only from a stated schema version, or accept a one-off documented
exception recorded as a decision. A second, smaller M2 note: the git-level
check needs fetch-depth 2 in CI, because actions/checkout defaults to a shallow
clone with no HEAD~1 and the check would silently not apply.

### F-031: M1 implementation choices SCHEMA.md does not fix
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 while building the validator. SCHEMA.md names each
violation but not the exhaustive behaviour of every rule, so the following were
decided in code and no fixture pins them. Each is one line to change if Hamza
rules otherwise. One, a missing status fires ERR_STATUS, on the reading that
"status is one of" makes it required. Two, ERR_DUP_ID is checked across the
whole tree, not per ledger, and is reported on the reuse rather than the
original, which expected/INV-02.json already pins. Three, errors are
deduplicated by code, file, id and line, so two bad members in one links field
report once. Four, a state.yaml that is absent or unparseable fires
ERR_SCHEMA_VERSION, same as one missing the key. Five, ERR_RATIONALE counts
non-empty prose lines. Six, the git-level check applies only when the validated
directory is itself the root of a git repository with a parent commit;
without that guard every fixture run inside this repo would diff this repo's
own history instead.
