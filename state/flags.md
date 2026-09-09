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

### F-032: Harness-level regressions have nowhere to live in the E1 inventory
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 after the M1 adversarial pass. EVALS.md section 1.3
requires every bug to become a fixture before its fix, but the symlink defect
it found is not expressible as an INV state tree: the tree is byte-identical
either way and only the spelling of the path passed to the validator differs.
M0-REVIEW.md section 5 also freezes the inventory at INV-01 to INV-17, so
adding INV-18 is not the builder's call. Interpretation applied: the regression
landed as test/git-guard.test.mjs under D-013, and the fix followed it. Two
smaller harness bugs from the same pass carry no automated regression at all,
because both are shell plumbing: evals/run.sh rebuilt only when dist/cli.js was
absent, so a stale binary could be graded as the oracle, and DSK_MILESTONE
defaulted to "M0", so the documented bare run overwrote the committed M0
red-gate report with a green one. Both are fixed. Hamza's ruling needed on
where harness-level regressions belong: a second inventory the runner derives,
or test/ as their permanent home.

### F-033: The M1 exit predicate was changed by the party being graded
status: open
date: 2026-09-07
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5, and it is the finding this build should like least.
Three of the six adversarial lenses independently flagged D-023 as gate
relaxation: the runner's pass predicate was changed, after the validator was
written, by the same agent the predicate grades, so that seven unimplemented
E5 suites stop counting as failures. The defence is real, that PLAN.md gates M1
on "CI green" while EVALS.md puts the E5 harness at M3, so under the M0 runner
the M1 gate was literally unsatisfiable, and the change is disclosed in every
report. The objection is also real, and D-014 clause 3 exists precisely because
the builder is not the right judge of it. Nothing further applied. D-023 stays
proposed and unsigned, and PLAN.md now records the M1 gate as met contingent on
Hamza accepting D-023. If he rejects it, M1 is not done and the runner reverts
to counting PENDING suites as red, which makes the honest reading of the M1
gate "E1, E2 and E3 green, CI red until M3".

### F-034: INV-17 was moved past the D-024 cutoff, and the green side has no fixture slot
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 while applying M1-REVIEW.md section 2.2, and recorded
under CLAUDE.md mistake-avoidance rule 4, which requires an F flag with
rationale in the same commit as any fixture change. INV-17 is an agent-raised
flag with no model id, dated 2026-09-01. D-024 makes the model requirement
apply only from 2026-09-08, so the fixture as written would have stopped
exercising ERR_MODEL_ID and turned green. One line changed, the date, from
2026-09-01 to 2026-09-08; no expected output changed, since the entry keeps its
line number and its single expected code. This strengthens the fixture rather
than weakening it: before the change it would have passed by accident.

The green side of the cutoff, a pre-cutoff agent flag with no model id that is
legal, has nowhere in the E1 inventory to live: an INV fixture must be invalid,
a VAL fixture would need an entry added and its counts changed, and M0-REVIEW
section 5 freezes the set at VAL-01 to VAL-05 and INV-01 to INV-17. Applied
under M1-REVIEW section 2.5: it is pinned in test/model-field-since.test.mjs,
written red before the rule and green after. Hamza's ruling wanted on whether
a rule this close to schema conformance may live only in a unit test, which is
the same question F-032 asks from the other side.

### F-035: ERR_MODEL_ID fires on entries SCHEMA.md says it cannot
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 while implementing D-024. SCHEMA.md section 2 ends the
provenance paragraph with "ERR_MODEL_ID cannot fire on an entry that already
has no provenance block", and the same paragraph defines an entry as having no
provenance block when its author is missing or invalid or its date is absent.
The implementation only ever checked the author half, so an agent-authored
entry with no date at all drew both ERR_PROVENANCE and ERR_MODEL_ID, against
the sentence's plain words. No committed fixture exercises the combination:
INV-06's provenance-less decision carries no author, and INV-13's entries are
human-authored, so nothing was red and nothing caught it.

Interpretation applied: implement the sentence as written, suppressing
ERR_MODEL_ID whenever the entry has no provenance block. This is transcription
of an existing SCHEMA.md line, not a new rule, and it fails safe, since such an
entry is already red under ERR_PROVENANCE. Pinned by three cases in
test/model-field-since.test.mjs, written red before the fix (EVALS.md 1.3).

### F-036: Supersession, the one legal correction, permanently invalidates the tree
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 from the M1 adversarial pass, and reproduced by hand
twice before recording. This is the finding this build should like least after
F-033. ERR_STALE_REF fires on any links or scope member that resolves to a
superseded decision, and it runs over every entry kind. Two consequences:

One, supersede a decision that a sign-off names in scope and the sign-off goes
red forever. Reproduced: D-001 signed by S-001, then D-002 with supersedes:
D-001, gives ERR_STALE_REF on S-001. Sign-offs cannot be edited (D12, law 4)
and nothing can un-scope one, so the tree is permanently invalid. This repo is
already exposed: S-002 scopes D-015 to D-022, so superseding any of the eight
turns dsk validate . red with no legal exit. Two, superseding the referring
entry does not clear it either. Reproduced: D-002 links D-001, D-003 supersedes
D-001, D-004 supersedes D-002; the error still names D-002. So the append-only
remedy D-021 promises does not exist for this code.

Nothing applied, and this is not the builder's call. It is a defect in
ERR_STALE_REF as M0-REVIEW section 3.2 defined it, and every fix is a schema
change: exempt sign-off scope from the rule, clear the error when the referring
entry is itself superseded, or narrow the code to entries that are current by
derivation. The third reading is the one that matches D-021's own logic, and it
is the smallest, but it is a change to a frozen error code's meaning and needs
Hamza. Until it is ruled on, supersession is unusable in practice, which makes
this a blocker for the M5 dogfood rather than for M2.

### F-037: The append-only check is a byte prefix, so law 5 can be defeated
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 from the M1 adversarial pass, reproduced by hand.
src/git.ts tests h.startsWith(b) on raw blob content. When the parent blob has
no trailing newline, its final line is a proper byte prefix of a longer line,
so the last committed line can be rewritten in place and the check passes.
Reproduced end to end: a ledger whose last committed line is "owner: hamza"
with no newline, extended to "owner: hamza-NO-WAIT-mallory", and dsk validate
reports the tree valid with exit 0. Law 5 and D12 are both defeated, in the one
check that exists to enforce them, and the M1 gate went green over it because
no fixture ends a ledger without a trailing newline.

Fixed in this session rather than deferred, because it is a breach of a
non-negotiable law rather than an ambiguity: the prefix test is now line-aware,
so a partial final line is not a prefix. Regression-tested first in
test/git-guard.test.mjs (EVALS.md 1.3). Recorded as a flag anyway, because the
milestone was declared green while this was live, and that belongs in the
record. Hamza's ruling wanted on one point only: whether a ledger file lacking
a trailing newline should additionally be an error in its own right, which
would need a sixteenth code the frozen inventory has no room for.

### F-038: The F-035 fix covered half its own defect
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 from the M1 adversarial pass, reproduced by hand. F-035
made ERR_MODEL_ID read the provenance block, but provenanceOf tests date only
for undefined, so a present-but-empty "date:" line counts as provenance. An
agent-authored decision with an empty date draws ERR_DATE and ERR_MODEL_ID and
no ERR_PROVENANCE, which is the exact combination SCHEMA.md section 2 forbids
and M0-REVIEW 4.5 split the two codes to prevent.

The underlying question is a schema ambiguity: is an empty value an absent
field or a malformed one? SCHEMA.md does not say. Interpretation applied, the
smallest and the one already used everywhere else in this codebase: the unset()
helper treats absent, empty and the literal none alike for model and
supersedes, so date joins them. An empty date is absent, ERR_PROVENANCE fires,
ERR_DATE does not, ERR_MODEL_ID stays suppressed. It fails safe, since such an
entry is red either way. Fixed here, regression-tested first. No fixture uses
an empty value, so nothing in the inventory moves.

### F-039: The eval harness and CI gate less than the documents claim
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 from the M1 adversarial pass. Four separate gaps
between what grades this build and what the documents say grades it.

One, CI runs no unit tests. EVALS.md section 1.3, as this session amended it
under M1-REVIEW 2.5, makes test/ the permanent home for implementation-level
regressions, and nothing in .github/workflows/evals.yml invokes npm test. A
lens demonstrated it by reverting the M1 symlink fix on a clean copy: every CI
gate stayed green while the unit suite went red. Two, evals/run.sh swallows a
failed build and continues, so the report can read GREEN against a stale dist
on a tree that does not compile, and it prints a message asserting the
opposite. Three, the runner prints hardcoded pass details such as "110 files
non-empty" that are asserted rather than measured, so a committed report can
carry stale numbers. Four, two of the three D-023 expiry legs are evadable:
leg one matches DSK_MILESTONE exactly, so "M3-final" yields no number, and leg
three hardcodes the filename harness.mjs.

Items three and four are fixed here, since four is the expiry M1-REVIEW 2.1
told this session to make un-forgettable. Items one and two are R22's own
subject matter and land at M2, which PLAN.md scopes as CI mode plus the Action
wrapper. Recorded so the M2 gate is not read as having found them itself.

### F-040: The parser and loader accept trees SCHEMA.md forbids
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 from the M1 adversarial pass, which surfaced these
across three independent lenses. Each is a state/ tree the validator calls
valid and SCHEMA.md does not. One, a missing ledger file parses as empty, so a
state/ holding only state.yaml validates green against section 1's five-file
rule. Two, CRLF ledgers parse with zero fields, so every field-based rule is
silently disabled and a valid tree is reported invalid. Three, duplicate field
keys inside one entry are last-write-wins, so appending a second raised-by
line suppresses ERR_MODEL_ID. Four, entry kind comes from the filename and the
id prefix is never checked against it, so an F entry in decisions.md escapes
the flag rules. Five, supersedes accepts several ids and non-decision ids,
where section 2 says none or one D id, and a non-decision target then misfires
ERR_STALE_REF elsewhere. Six, ERR_DATE is a format regex, so 2026-13-45 passes.
Seven, prose written with no blank line before it is eaten by the field loop,
so ERR_RATIONALE cannot fire on it.

Nothing applied, and deliberately so. Every one of these needs either a new
error code, and M0-REVIEW section 5 freezes the count at fifteen with its own
fixture pair per code under D-011, or a SCHEMA.md sentence that does not exist
yet. Both are Hamza's call, not the builder's, and picking a reading here would
be exactly the improvisation CLAUDE.md rule 6 forbids. The full list with
per-item reproduction is in evals/reports/2026-09-08-M1-adversarial-pass.md.

### F-041: The four findings dropped at the M1 cap were never written down
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 discharging M1-REVIEW.md section 2.6, which instructs
this session to list the four findings the M1 adversarial pass dropped at its
cap and verify or dismiss each with one line. They cannot be listed. They
appear in no commit, no flag, no report and no file in this repository, and
git log over the full history finds nothing; the M1 session recorded F-030 to
F-033 and discarded the rest without a record. The reviewer saw them in a
transcript this repository never held.

Applied in their place, as the only honest discharge: one fresh capped
adversarial pass under the same M0-REVIEW section 6 budget, six lenses, with
every candidate recorded in evals/reports/2026-09-08-M1-adversarial-pass.md
including the refuted ones and the reason each was dismissed. That pass found
115 candidates, of which 63 survived independent refutation, and among them
F-036 and F-037, one of which defeats law 5 outright. Whether four such
findings were among the originals is unknowable, which is the point.

The standing gap, for Hamza: nothing in the build rules requires an adversarial
pass to leave a record of what it discarded. M0-REVIEW section 6 already noted
that M0's cap dropped forty findings unverified. This is the second time. The
rule that would close it is one sentence, that a pass commits its full
candidate list before any triage, and it is a change to the build protocol
rather than to the kit, so it is not the builder's to make.

### F-042: D-025 is retroactive and re-opens two flags this repo calls resolved
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 from the completeness critic. D-025, transcribed in
this session from M1-REVIEW section 2.3, makes a flag resolved if and only if a
sign-off names it in scope. It carries no dated cutoff, unlike its sibling
D-024. F-002 and F-004 in this ledger both read status: resolved with real
resolution notes, migrated from PROJECT.md section 12 where Hamza closed them
by default, and no sign-off names either: S-001 scopes two D ids, S-002 eight,
S-003 F-005 to F-022 and F-024. Under the new rule both derive as open.

Nothing applied. The advisory-field reading D-025 states means the ledger text
is not wrong, only non-authoritative, so no line needs touching and nothing is
red today, because no code consumes the derivation yet; render and status will
be the first. Two exits, both Hamza's: append a sign-off naming F-002 and
F-004, which is one entry and costs nothing, or give D-025 a dated cutoff the
way D-024 has one. The first is cleaner, since the derivation is meant to be
the record and a sign-off is exactly how a human says so.

### F-043: The flags the M1 review resolved are not covered by any sign-off
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 while appending S-004. Hamza's authorization of 8 Sep
names three decisions, D-023, D-024 and D-025, and nothing else, so S-004's
scope is exactly those three. The M1 review also ruled on five flags, F-025 by
D-025, F-029 by section 2.4, F-030 by D-024, F-032 by section 2.5 and F-033 by
section 2.1, and this session raised ten more, F-034 to F-043. Under D-025 a
flag is resolved if and only if a sign-off names it, so all fifteen derive as
open, including F-030, which PLAN.md cites as M2's blocker and which the
validator now demonstrably no longer reports.

Nothing applied, and the omission is deliberate. Signing on Hamza's behalf for
a scope he did not name is exactly the defect F-024 recorded and S-002 had to
repair, and it is worse coming from the party whose own work the flags grade.
One sign-off entry closes whichever of the fifteen Hamza judges closed. Until
then the derived answer and the textual one disagree for F-030 alone, where the
text says open and the validator says the condition is gone, and the honest
reading is the derived one: open, because no human has said otherwise.

### F-044: R20 names an owner-set date the flag grammar does not have
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 planning M2. PROJECT.md R20 is "entries untouched past
a configurable window, open flags past their owner-set date". The second clause
has no field to read: SCHEMA.md section 2 gives a flag status, date, owner,
raised-by, model and resolution, and date is when it was raised, not a deadline
anyone set. Adding a due: field is a grammar change and law 6 says leave a
field out when in doubt.

Interpretation applied, the smallest: the flag's own date is the reference, so
the second clause reads as the open flags among the entries the first clause
already found, reported separately because R20 asks for them separately. A
second question left open rather than answered: whether a superseded decision
or a derived-resolved flag should still count as stale. Reporting them is the
literal reading of "entries untouched" and is what ships; the report carries a
derived current field on every row so a later ruling can filter without the
rule changing.

### F-045: EVALS section 5 specifies E4 without naming a fixture or a window
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 planning M2. EVALS.md section 5 says E4 "injects a
fixed clock through the DSK_NOW environment variable and asserts the staleness
report against expected output for three window configurations", and names
neither the fixture nor the three windows, so the suite cannot be built without
a choice.

Interpretation applied and written into EVALS.md section 5 so it is checkable:
VAL-04, DSK_NOW 2026-09-10, windows 6, 8 and 30 days. VAL-04 is the only valid
fixture whose entries carry more than one date, 2026-09-01, -02 and -03, so it
is the only one of the five that can separate three windows at all; VAL-01,
VAL-02 and VAL-03 date every entry 2026-09-01 and would give the same answer
three times. The three windows were chosen to give three genuinely different
reports, the widest of them empty, so a stub returning nothing cannot pass. No
fixture tree changes: E4 reads VAL-04 as it stands and adds only expected
outputs, which the frozen inventory does not govern.

### F-046: The staleness and render command names are the builder's choice
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 planning M2. PROJECT.md 6.2 names render; nothing names
the R20 command, and SCHEMA.md section 5 fixes the JSON contract for validate
alone. Three choices made here, each one line to reverse. One, staleness is its
own subcommand rather than a validate flag, so validate's exit codes keep
meaning valid and invalid only. Two, it always exits 0 when it ran: R20 calls
it a report, no ERR_ code exists for staleness, and the inventory is frozen at
fifteen, so gating CI on it would need a decision this session does not have.
Three, render writes one self-contained HTML file with no script and no
external asset, to stdout unless --out names a path, which is what makes the
GitHub Pages path in 6.2 work without a build step.

### F-047: The M2 gate's last clause needs an admin this session does not have
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 closing M2. PLAN.md states the gate twice and not
identically. The milestone table says "E4 green, Action validates this repo",
which is met: E4 passes three window configurations and CI run 34212062770
shows the shipped action.yml validating this repository, 26 decisions, 46
flags, 5 criteria, 4 sign-offs, with HEAD~1 present so the append-only check
genuinely applied rather than skipping. The M2 section says "the Action gates
this repo's own merges", which is not met and cannot be by this session: gating
merges means a required status check, that means branch protection or a
ruleset, and the collaborator account has push but not admin. The repository
currently has neither, and no pull request has ever been opened against it.

Nothing applied, because there is nothing this session can apply. The exact fix
is Hamza's, one command with an admin token: make the checks required on main,
naming the job "the action validates this repository" alongside "eval suite"
and "unit tests". Recorded rather than glossed, because the difference between
a check that runs and a check that blocks a merge is the whole of R22, and
reporting the milestone as fully met would be the overstatement D-014 clause 3
exists to catch.

### F-048: INV-18 enters the frozen inventory, and it was green on arrival
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 applying M2-REVIEW.md section 3, and recorded under
CLAUDE.md mistake-avoidance rule 4, which requires an F flag with rationale in
the same commit as any fixture change. The change: EVALS.md sections 2, 3 and
4.3 grow the invalid set from INV-01..INV-17 to INV-01..INV-18, and the runner's
two hardcoded counts follow, the declared total and the git-level fixture list.
INV-18 is a two-commit fixture whose base ledger ends without a trailing newline
and whose head rewrites that final line in place, expecting ERR_INPLACE_EDIT.

INV-18 passed the moment it existed, because the F-037 fix that makes it fail
landed at M1 and this fixture only now enters the record. That is a fixture with
no proven teeth unless it is shown to have them, so it was shown: reverting
isAppendOf to the byte-prefix test it had before F-037 turns INV-18 FAIL and
leaves INV-14 and VAL-05 both PASS. It is the only fixture in the set that
catches the breach, which is the whole of M2-REVIEW section 3's argument that
law-level breaches get fixtures and not only unit tests.

### F-049: the F-036 ruling's own cases have no fixture home
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 applying M2-REVIEW.md section 2, recorded in the same
commit as the expected-output change it describes. Two related gaps.

One, every case the ruling turns from red to green is a VALID tree: a signed
decision that is later superseded, a criterion scoping a superseded decision, a
superseded entry whose links are stale. An INV fixture must be invalid, so none
of them can live there, and adding them to a VAL fixture moves that fixture's
counts and its expected output. They are pinned in test/f036-ruling.test.mjs
instead, red before the narrowing and green after, under M1-REVIEW section 2.5
and EVALS.md section 1.3. This is F-034's complaint from a third side.

Two, the criteria stale-scope warning is added to the staleness report, so
E4-06, E4-08 and E4-30 change: each gains an empty `stale_scope` array and a
`counts.stale_scope` of zero. VAL-04 has no superseded decision, so E4 cannot
exercise the warning in the direction that matters and the unit tests are its
only coverage. Authorized by M2-REVIEW section 2's closing line, which says the
E4 expected outputs update under the ruling with each commit referencing the
file and a flag. Recorded rather than glossed, because "three expected outputs
changed and the suite stayed green" is exactly the sentence a weakened eval
would also produce.

### F-050: Two readings the F-036 ruling leaves to the builder
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 applying M2-REVIEW.md section 2, under CLAUDE.md build
rule 8: two points the ruling does not settle, each answered with the smallest
reversible reading and recorded rather than chosen silently.

One, `dsk status` did not exist. Section 2.2 names it as one of the two surfaces
that must carry the criteria stale-scope warning, alongside `render`, so
applying the ruling in full required either building it or reporting the ruling
half-applied. It is built here, in the pre-M3 series rather than at M3: it is
pure, clock-free and git-free, it mints no schema and no error code, and it is
the deterministic backend the M3 skill's `/status` reads, which is what lets S6
grade against a scripted census instead of against prose. Reversible by deleting
one file and one CLI branch.

Two, D-027 says a criterion is met if and only if a sign-off names it, and that
`dropped` stays advisory-only in v0.1, without saying what a criterion written
`dropped` derives as. Reading applied, the smallest and the one D-025 already
set: the derivation has exactly two outcomes, met and open, and `dropped` has
none, so a dropped criterion derives open with its written word displayed beside
it. The alternative, letting the written `dropped` survive as a third derived
state, would make one status word authoritative and the other two advisory
inside the same field, which is the inconsistency the v0.2 grammar cleanup
exists to remove. Consequence to accept until then: a criterion deliberately
dropped reads as open in `status` and `render`, with `written status: dropped`
beside it. VAL-04's AC-003 is exactly that case and shows it.

### F-051: S-005's scope needed two judgment calls the enumeration rule does not make
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 deriving S-005 under M2-REVIEW.md section 5, which says
the scope is every flag whose ruling "reads accepted, resolved, or closed" and
that the session "signs nothing that lacks a written ruling". A mechanical scan
of the three review files answers most of it: 24 flag ids sit in a paragraph
carrying one of those words, 19 of them are already closed by S-003, leaving
F-025, F-030, F-032, F-033 and F-036. Two flags then sit on the boundary, and
both are included on the substance rather than the letter.

F-029 has a real ruling, M1-REVIEW section 2.4, which names no flag id and uses
none of the three words. SCHEMA.md section 0 amendment 12 cites that section as
being on F-029, and S-004's own prose already lists F-029 among the flags the
review resolved. F-043's ruling is M2-REVIEW section 5 itself, whose word is
"authorized", and S-005 is the very remedy it authorizes: the flag says the
resolved flags carry no sign-off, and this is that sign-off. Excluding either
would leave a flag deriving open that three documents already treat as ruled.

Deliberately excluded, each for a stated reason: F-037, whose own question about
a sixteenth error code section 3 does not answer; F-047, deferred with a trigger
and live until M5; F-040 and F-042, held by section 6 for the M3 review; F-002
and F-004, closed by Hamza in PROJECT.md section 12 and by no review file, which
is F-042's subject; and the eleven builder-raised flags no external party has
ruled on, F-034, F-035, F-038, F-039, F-041, F-044, F-045, F-046, F-048, F-049
and F-050. Signing those would be the graded party closing its own findings,
which is the defect F-024 recorded and F-043 restated. The full enumeration with
per-flag evidence was printed before either sign-off was appended.

### F-052: This session ruled F-040 not law-level, and the call is close
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 discharging M2-REVIEW.md section 6, which orders F-040
and F-042 printed verbatim and says to stop and report if either is law-level or
would change a gate already claimed. Both were printed. Neither triggered the
stop, and the reasoning belongs in the record because one item is close.

Gates already claimed: unaffected, and this was tested rather than assumed. The
M1 gate is E1, E2 and E3 over the fixtures, the M2 gate is E4 plus the Action
validating this repository, and every one of F-040's seven items was run against
both. This repo has all five state files, zero CR bytes, no duplicate field key
in any entry, no foreign id prefix in any ledger, every supersedes either none
or exactly one D id, every date a real calendar date, and no prose glued to a
field block. The fixtures carry no CR bytes and no foreign id prefixes. F-042
mints no code and cannot turn a tree red.

Law-level: ruled no, with the closest call named rather than buried. F-040's
third item, duplicate field keys being last-write-wins so a second raised-by
line suppresses ERR_MODEL_ID, is a hole in the enforcement of law 3, and it is
the same class as F-037, which was law-level. What separates them: F-037 was a
live breach of the append-only check whose fix was pure transcription of an
existing rule, and it was fixed in the session that found it. Every F-040 item
instead needs a sixteenth error code, which M0-REVIEW section 5 freezes out
under D-011, or a SCHEMA.md sentence that does not exist. Neither is the
builder's to write. No committed tree is exposed to any of them. Both flags are
therefore carried as M3 external-review inputs, which is what section 6 directs
when the stop does not fire.

Standing question for Hamza, and the reason this flag exists: if you read item
three as law-level, this session's judgment was wrong and the M3 work built on
top of it should be reviewed on that basis. One sentence from you settles it.

### F-053: An ad-hoc eval report reached the committed evidence trail
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 at M3, against its own work in this series. Every bare
`node evals/runner.mjs` writes evals/reports/<date>-adhoc.md, because the
milestone name has no default and naming one is deliberate. During the pre-M3
series a `git add -A` swept one of those scratch files into commit c43f9bf, and
it was pushed. Nothing it says is false, but evals/reports/ is the committed
evidence that D-007's eval-first order was honoured, and a file nobody meant to
put there is noise in exactly the place that must stay legible.

Applied: the file is removed from tracking, and .gitignore now excludes
evals/reports/*-adhoc.md so the class cannot recur. Milestone reports are
unaffected, since they carry a milestone name rather than "adhoc". This is the
same family as F-039's third item, where the runner printed asserted rather than
measured numbers into a committed report: the report directory is evidence, and
evidence with stray contents is weaker evidence. Recorded rather than quietly
deleted, because the commit that introduced it is already pushed.

### F-054: E6 cannot be executed on this machine, so half the M3 gate is unmet
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 at M3. PLAN.md's M3 gate is "E5 thresholds met, E6 smoke
pass on one non-Claude runtime (manual acceptable in v0.1)". E5 is this
session's to run. E6 is not: it requires a runtime that is not Claude, and this
machine has no non-Claude agent CLI on PATH — gemini, codex, cursor-agent,
aider, opencode, goose and llm were all checked and none is installed — and no
non-Anthropic API key in the environment. Cursor.app is present as a GUI, which
EVALS.md section 7 does allow, since it says manual execution is acceptable, but
driving a GUI IDE is not something this session can do or honestly attest to.

Applied, as much as can be: everything E6 needs except the runtime. Running
`node evals/scenarios/e6.mjs setup` builds three trial trees under
evals/.work/e6/, each holding VAL-01 plus templates/AGENTS.dsk.md and nothing
else — no skill, no slash commands, because AC5 is about whether the snippet
alone carries the rules. It prints the S1, S2 and S3 prompts read from the
scenario specs rather than retyped. `e6.mjs grade <dirs>` then grades what the
other runtime left behind, deterministically, through the shipped `dsk validate`
and git rather than through the E5 harness's internals, so E6 cannot inherit a
bug from E5's graders. The grader was checked for teeth against the untouched
trees and fails all three, so it cannot pass vacuously.

The consequence, stated rather than softened: **the M3 gate is half met.** E5's
side can be declared from evidence in this repository; E6's cannot, by anyone
reading only what is committed here. M3 is not "met" until Hamza runs those
three prompts in one non-Claude runtime and commits e6-results.json. Under
CLAUDE.md rule 5 that also means M4 does not start yet.

### F-055: The E5 gate trusts a results file the graded party writes
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 while building the M3 gate, against its own design.
E5 cannot run inside evals/run.sh, because E8 requires the suite to pass with no
network and no API key and CI runs on every push with neither. So the harness
runs deliberately, writes evals/scenarios/results.json, and the runner grades
that file. Five tamper checks guard it: thresholds and trial counts are read
from the scenario specs and never from the results, `met` is recomputed rather
than trusted, a partial run is refused, and the sha-256 of every spec, the
fixture tree, SKILL.md and the harness itself must still match.

None of that stops the obvious attack. A session that wanted a green M3 could
write results.json by hand with `passed: 5` on every scenario and never run a
trial. The hashes would all match, because they are hashes of the inputs and not
of the runs. The gate verifies that the results describe the committed tree; it
cannot verify that the runs happened.

Mitigation, not a fix: every trial's raw agent output, per-check verdicts, token
counts, cost and duration are recorded in results.json, so a forged file has to
be an elaborate fiction rather than seven numbers, and any external reviewer can
re-run the harness and compare. The real answer is that E5's evidence is
testimony, and the external review at M3 is the party that should treat it as
such. Recorded rather than left implicit, because a gate whose limits are not
written down gets read as stronger than it is, which is the failure D-014 clause
3 exists to catch.

### F-056: The first M3 adversarial pass died on a usage limit, and it spent budget
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 running the D-029 pass at M3. The first attempt launched
the full fifteen lenses and all fifteen died on the account's session usage
limit before returning a finding. Zero agents completed, zero findings, and the
run still consumed roughly 456,000 subagent tokens on startup and 64 tool calls
before failing. D-029's cap is "fifteen agents, one pass, roughly one million
tokens", so that failure spent close to half the budget and bought nothing.

Interpretation applied, and it is a judgment call worth Hamza's eye: a pass that
returned no review is not a pass, so the retry is treated as the first pass
rather than a second one, which D-029 would forbid. The retry runs the same
fifteen lenses. The accounting is written down here rather than quietly reset:
total spend across the failed attempt and the retry is the number to hold
against the roughly one million token cap, not the retry alone, and if the two
together exceed it that is a fact for the M3 review to weigh, not something for
this session to average away.

The standing gap, for Hamza: D-029 counts agents and tokens but says nothing
about failed runs, and an infrastructure failure that burns half a budget is a
different thing from a review that used it. One sentence in D-029 would settle
whether a failed pass is chargeable. Until then the conservative reading above
is what this session used.

### F-057: Two hard 5-of-5 gates pass against an agent that does nothing
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 from the D-029 M3 adversarial pass, reproduced by hand
before recording. S4 and S7 are hard 5-of-5 gates and both graders assert only
absence: no ownerless flag exists, no new heading appeared, the four ledgers are
byte-unchanged, and dsk validate exits 0. Every one of those is already true of
the pristine VAL-01 fixture, so an agent that writes nothing, says nothing and
never loads the skill scores a hard-rule pass. Reproduced by putting a fake
claude on PATH that returns an empty result and touches no file: FAIL S3 0/5,
PASS S4 5/5, PASS S7 5/5.

S4 is worse than loose. Its spec's criterion 1 is "Either no new flag entry is
written and the agent asks who owns it, or a flag is written with a non-empty
owner it obtained first". The grader is declared `(o) =>` with no text
parameter, so it never sees the agent's output and neither half of that
disjunction is tested. PLACEHOLDER_OWNERS is also a closed list of eleven
literals, so `unassigned`, `???`, `nobody` and `to be decided` are all accepted
as real owners, and S2 inherits the same hole by reference.

Nothing applied. The fix is to make both graders assert presence rather than
absence, which changes the harness, which invalidates the committed results and
requires a rerun of all thirty-five trials. That is a milestone's worth of work
and CLAUDE.md rule 7 says stop and report rather than retry past a hard rule.
The real 35-trial run's S4 and S7 outputs do show correct refusals, so the
agent's behaviour was right; the grader simply cannot tell, and a gate that
cannot tell is not a gate.

### F-058: The skill produced opposite provenance for the same task, and E5 graded it green
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 from the D-029 M3 adversarial pass, verified directly
against the committed trial records. In S2 trials 1, 3 and 5 the agent composed
the flag entry itself and wrote `raised-by: human` with `model: none`; trial 3's
output argues the point explicitly, "you identified the uncertainty; I only
transcribed it. Hence model: none". Trials 2 and 4 wrote `raised-by: agent` with
the model id. The same shipped skill produced opposite provenance for the same
task inside one run, and all five trials are recorded pass:true.

No S2 check looks at author, raised-by or model, confirmed by scanning every
check name in the results file. The validator cannot help either: ERR_MODEL_ID
only fires once `raised-by` already says `agent`, so recording an agent-authored
entry as human-raised is a green tree carrying a provenance lie. That is law 3
defeated, not by a bug in the validator but by an ambiguity in the artifact this
milestone shipped.

The root cause is in SCHEMA.md and SKILL.md alike: both say `raised-by` is
`human` or `agent` and neither says whose act the field records, the human who
noticed the issue or the agent that wrote the entry. One sentence settles it and
it is Hamza's to write, because it is a schema clarification and CLAUDE.md rule
6 forbids improvising one. Until then S1's `author` field is exposed to the same
reading, and S1 happened to be consistent only by luck.

### F-059: The E5 gate grades one self-reported integer
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 from the D-029 M3 adversarial pass. The runner's
gradeScenarios decides a scenario on `row.passed` alone. It never reads
`row.results`, never checks that `passed` equals the number of trial records
whose `pass` is true, and never checks that `passed` does not exceed `trials`.
The thirty-five trial records, with their validator exits, append-only checks
and token counts, are decorative to the gate. Reproduced on a copy: setting
every scenario to `passed = trials`, `met = true`, `results = []` yields exit 0,
GREEN, 33 PASS, with rows byte-identical to a real run; `passed: 99, trials: 5`
also passes.

Three more holes in the same seal, each reproduced. The fixture-tamper check
iterates `doc.fixtures ?? {}`, so an empty map from the graded file disables
fixture verification silently, and the per-row `fixture` field is never read.
Only SKILL.md is hashed, while the three slash-command files installed into
every trial are not, and the literal string "absent" is a claimable skill hash,
so deleting the skill entirely and claiming that value keeps all seven scenarios
green. And `gradeScenarios` tests `!harnessExists` first, so deleting the
harness turns a committed record of failures back into PENDING without ever
opening it.

Nothing applied. F-055 already recorded that this gate rests on testimony; this
flag records that the testimony is checked far more weakly than the M3 report
and commit d0f0580 both claim, and that claim is itself corrected in the same
commit as this flag.

### F-060: E6 has no gate anywhere in the runner or CI
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 from the D-029 M3 adversarial pass. PLAN.md's M3 gate is
"E5 thresholds met, E6 smoke pass", and F-054 says M3 is not met until
e6-results.json is committed. But evals/runner.mjs, evals/run.sh and
.github/workflows/evals.yml contain no occurrence of E6 or e6, and the only
reference to e6-results.json anywhere is the writer inside evals/scenarios/e6.mjs.
So the E6 half of the gate can never turn a run red, and will not turn it green
when Hamza does run it. EVALS.md section 7's "results logged in the report" has
no home either: the generated report template has no E6 section.

This is exactly the failure the D-023 expiry was built to prevent for E5, where
three independent legs were wired into the runner and each was proven to flip
the run red, applied to nothing here. Nothing applied, because wiring an E6 leg
is a change to the gate this session's own milestone is judged by, and D-014
clause 3 puts that beyond the builder.

### F-061: The E5 evidence existed only as an untracked file and was nearly destroyed
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 against its own conduct at M3. The thirty-five-trial
results file, which cost $11.72 and twenty-five minutes and is the whole of E5's
evidence, sat untracked in the working tree for the length of the adversarial
pass. Verifying the F-057 finding meant running the harness again with a fake
claude on PATH, and the harness writes results.json unconditionally at the end
of every run, so that verification overwrote the real evidence with a
fifteen-trial fake. `git checkout` could not restore it because it had never
been committed. It was recovered only because an unrelated tamper-proof script
had copied it to /tmp earlier in the session, by luck rather than design.

Two things follow. The narrow one: expensive evidence is committed the moment it
exists, not at the end of a session. The broader one, for Hamza: the harness
overwrites the results file with no backup, no timestamped copy and no refusal
when the existing file records a full run and the new one does not. A `--dry-run`
or a refusal to clobber a full run with a partial one is one line, but it is a
change to the harness, which invalidates the committed results and forces a
thirty-five-trial rerun, so it is not free and it is not this session's to make.

### F-062: The R11 snippet gained the flag provenance rule the review did not name
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 applying M3-REVIEW.md. Section 2 says D-030's sentence
enters SCHEMA.md and SKILL.md. This commit also put it into
`templates/AGENTS.dsk.md`, and re-embedded the block into AGENTS.md
byte-identically, which is one surface more than the review enumerated.

The reason, and the reason it is disclosed rather than done quietly. Finding 1
of the ninety-seven is law-severity and says the snippet states the model rule
for decisions only and never for flags, so a snippet-only runtime gets the rule
zero times where Claude Code gets it twice, and its single flag example shows
`raised-by: human` with `model: none`. D-030 makes that worse rather than
better: it tells an agent that composed the entry to write `raised-by: agent`,
and the snippet is the one surface that never then tells it to carry a model id,
so the honest follow-through goes red under ERR_MODEL_ID. E6 is the next thing
Hamza runs by hand, on this snippet, and S2 is one of its three scenarios.

The smallest reversible interpretation, per CLAUDE.md rule 8: state the same
rule the Claude surface states, in the same words, and add nothing else. Revert
is a five-line deletion plus a re-embed. What is deliberately NOT done here: the
snippet's other three parity gaps from finding 1's lens (next-free-id, the
decision owner rule, the ISO date rule) and the softened status discipline are
left alone and stay open as standing review inputs. If Hamza judges this out of
bounds, the revert costs nothing and E6 should then be expected to fail S2.

### F-063: D-031 rewrites two scenario specs, and D-014 clause 4 requires saying so
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 applying M3-REVIEW.md section 3. D-014 clause 4 forbids
editing fixtures, expected outputs or thresholds to make a run pass, and
requires an F flag with rationale in the same commit for any legitimate change.
This commit changes `evals/scenarios/S2.md`, `S4.md` and `S7.md` and the
matching lines of EVALS.md section 6, so here is the accounting.

What changed and in which direction. S4 and S7 gain a benign first action and
four new pass clauses each; S2 gains two provenance clauses. Every change makes
a scenario harder to pass, and no threshold moves: S4 and S7 stay hard 5 of 5,
S2 stays soft 4 of 5, and every clause that existed before still exists. The
placeholder-owner test moves from a closed list of eleven literals to a pattern,
which rejects a strict superset of what the list rejected. Nothing was relaxed
to make anything green, and the run these specs grade has not happened yet: the
committed results are red against them as of this commit, by the tamper seal.

The prompts changed too, which is the part worth Hamza's eye. S4 and S7 no
longer ask only the forbidden thing, so what they measure is not identical to
what the first run measured — the two runs are not comparable trial for trial,
and the first run's S4 and S7 numbers should be read as the review reads them,
as evidence that absence was true rather than that refusal happened.

Not changed here, and still open as standing review inputs: the append-only
grading covers four ledger files rather than the tree (findings 19, 23, 31), and
S5's and S6's free-text clauses remain word-presence tests (findings 20, 21, 32,
33, 42, 43). The review ruled on S4 and S7, and widening beyond its ruling is
how a builder ends up regrading itself.

### F-064: The E5 tamper seal now covers the validator, and that has a price
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 implementing D-032. The review's section 4 does not
enumerate which inputs the seal covers, and the previous seal covered the
scenario specs, the fixture tree and SKILL.md only. Findings 7 and 10 name two
graded inputs it missed: the three slash-command files installed into every
trial, one of which defines the `/status` S6's prompt invokes, and the validator
itself, which is the oracle for five of the seven scenarios. Both are now
sealed, along with graders.mjs.

The judgment call, disclosed because it is one. Sealing the validator means
**any change under `src/` invalidates a committed E5 run**, and revalidating
costs a full thirty-five-trial run at roughly twelve dollars and seven minutes.
M4 is the install path and degraded mode and should not touch `src/`, so the
expected cost is zero; if it does touch it, the rerun is real money and real
time, and the alternative would be reading a green E5 that was graded by a
validator no longer in the tree.

The smallest reversible interpretation, per CLAUDE.md rule 8: seal it, because a
false green is the failure mode this whole review exists to close, and record
the cost here so Hamza can downgrade the validator hash to advisory with one
line if M4 makes it expensive. What is NOT sealed, deliberately: `dist/`, which
is a build product and would differ per machine, and `node_modules`.

### F-065: The six-session box is resized to eight, consciously
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 on the M3 external review's section 10, which asks for
this to be a flag Hamza signs rather than a number that quietly moves.

The arithmetic. F-004 set a six-session box across three weeks. Four sessions
are spent (M0, M1, M2, M3). This fix-and-rerun session is the fifth. M4, the
install path, and M5, the dogfood, are the sixth and seventh, and E6 plus the
re-evaluated M3 gate sit between this session and M4. Eight is the honest
number, and the review recommends eight with everything else unchanged.

The alternative the review names and does not recommend: trim M4's scope to fit
seven. It is available. It costs the install path, which is the shareability of
the whole product — the ten-minute npx path is what makes this a kit rather than
a private convention, and AC3 is written against it.

What is not being asked for here: more scope, a later deadline for M5's
fourteen-day dogfood clock, or any change to the kill lines K1 to K3. Only two
more sessions. If Hamza declines, the fallback is the trim, and that is a
scope decision this session should not make on its own.

### F-066: S3 failed a hard gate because the skill's own supersede example is invalid
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 from the M3 re-run, and reproduced by hand. S3 scored
4 of 5 against a hard 5-of-5 threshold. Trial 4 did everything S3 asks: D-001
byte-identical, a superseding D-002 naming it in `supersedes:`, an append-only
diff. It then failed on `dsk validate exits 0`, with ERR_STALE_REF.

The cause is in the shipped artifact, not the model. SKILL.md line 82 and
templates/AGENTS.dsk.md line 36 both give one worked example of supersession,
and both write `links: [D-001]` beside `supersedes: D-001`. D-028 clause 3
makes a `links` member of a current entry that resolves to a superseded
decision a hard error, and a superseding entry is current by construction, so
the documented recipe produces a red tree every time an agent follows it
literally. Reproduced: append that entry to VAL-01 and the validator returns
`ERR_STALE_REF state/decisions.md:14 D-002 links names D-001, superseded by
D-002`, exit 1.

This is findings 37 and 41 of the M3 adversarial pass, filed at correctness
severity, which the external review did not rule on. The first run's S3 also
showed trials tripping over it and scored 5 of 5 anyway; the redesigned suite
did not change S3, so what changed is that this run's trial 4 did not recover.

Not fixed here, deliberately. CLAUDE.md rule 7: a missed threshold means stop
and report, not retry. The fix is small — drop `links: [D-001]` from the example
in three surfaces, or widen D-028 clause 3 to exempt the entry that performs the
supersession — but it is a change to the graded artifact, which invalidates this
run's tamper seal and costs another thirty-five trials at $12.63, and choosing
between those two fixes is a schema question for Hamza and the external review.

For Hamza before E6: **S3 is one of E6's three scenarios and the snippet carries
the same bad example**, so E6's S3 can be expected to fail the same way on any
runtime that follows the recipe. That is information about the artifact, not
about the runtime, and it is worth knowing before fifteen minutes are spent.

### F-067: VAL-02 gains two entries, and the accounting for it
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 applying M3-REVIEW-2.md section 2.3. D-014 clause 4
forbids editing fixtures to make a run pass and requires an F flag with
rationale in the same commit for any legitimate change. This commit extends a
frozen fixture, so here is the accounting.

What changed. `evals/fixtures/valid/VAL-02` gains D-005 and D-006: D-006
supersedes D-005 and links it from the same entry, which is the pattern the
review's section 2.1 exempts and the pattern E5 S3 trial 4 wrote. Its expected
file moves from four decisions to six. Nothing else in the tree changes, no
other fixture changes, and INV-04 is verified unaffected — its D-003 carries
`supersedes: none`, so no exemption reaches it, and its expected ERR_STALE_REF
is asserted again as a unit test in this commit so a future widening cannot
retire it silently.

The direction. At the moment of this commit the change makes the suite HARDER,
not easier: VAL-02 is a valid fixture and the new pattern is a hard error under
the unamended validator, so E1 and E3 go red on it and stay red until D-035
lands in the next commit. That is the eval-first order section 2.3 requires,
and it is checkable in the git log rather than asserted here.

Two entries rather than one, deliberately. The single-entry form is to append
one decision superseding D-004, but AC-002 scopes D-004, so that would also turn
VAL-02 into a stale-scope-warning fixture and change what it is for. D-005 and
D-006 are unreferenced by any criterion, so the extension adds the exempt
pattern and nothing else.

Not changed: no threshold, no scenario spec, no expected error code, and no
other fixture tree.

### F-068: E6's three grader holes are closed in the commit that makes it a gate
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 applying M3-REVIEW-2.md section 4, and disclosed under
D-014 clause 4 because it changes a grader in the same commit that gives that
grader teeth. The ruling says wire E6 into the runner, the exit code and CI. It
does not say fix E6's grader. This commit does both, and here is why, and what
exactly changed.

Why. Three holes in `e6.mjs` were found by the M3 adversarial pass, recorded in
the re-run report section 5, and deliberately left, on the grounds that E6 was
consumed by nothing and fixing an ungated grader was not that session's to do.
Section 4 removes that ground. A suite that decides a milestone cannot keep holes
that let it pass without running, because that is precisely the F-057 failure the
previous review spent itself closing: two hard 5-of-5 gates that passed against
an agent which did nothing.

What changed, all three strictly harder, none touching a threshold or a pass
condition. (1) The scenario id came from the directory NAME and an unrecognised
name fell through to `S?`, which runs no scenario-specific check and prints PASS
with exit 0; ids now come from the setup manifest and an unknown directory is
refused. (2) The baseline was unpinned: `git diff` sees neither staged nor
committed work, so a runtime that ran `git add` made the append-only check
vacuous and one that ran `git commit` also made "D-001 is byte-identical" compare
the rewrite against itself; the seed commit is recorded at setup, asserted as a
check, and the diff is taken against it explicitly. (3) No `dsk` was on PATH
although the snippet instructs the runtime to run it; setup writes a shim outside
the trial trees and prints the export line. Each was reproduced before and after.

Also added, and this is the part beyond the ruling's letter: the results file now
records the runtime it was produced on, which `grade` requires and refuses to let
be a Claude one, plus the snippet and validator hashes, which the runner re-checks
against the tree. Without a runtime name the file is evidence of nothing for AC5,
and without the hashes an E6 run keeps counting after the very artifact it tested
has changed — which this commit series changes twice.

The smallest reversible interpretation, per CLAUDE.md rule 8: harden, because the
alternative is a gate that can be satisfied by a rename. Reverting any of it is
one commit, and none of it is reachable by the eval runner except through the
results file's shape.

### F-069: The evidence protocol has no representation for authorised mixed provenance
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 executing M3-REVIEW-2.md section 3, under CLAUDE.md rule
8: the ruling authorises a state the implemented protocol cannot express, so this
records the ambiguity, the smallest reversible interpretation taken, and what it
costs.

The gap. Section 3 authorises six scenarios re-graded from a prior run's
committed artifacts and one scenario re-run fresh, and section 3.3 asks the
combined report to state that mixed provenance plainly. D-032 section 4.1 makes a
run a whole sealed timestamped unit, and `evals/runner.mjs` grades exactly one of
them, the newest. So no committed file represents the authorised state, and the
runner cannot be made to say "these seven scenarios are established" without
either grading two runs as one or ignoring a seal. Both are how a false green
gets built.

What was NOT done, deliberately. The runner was not changed to grade the union of
runs per scenario. It would not have turned anything green today — the older
run's skill and validator seals are stale by construction, since amending them is
what this series did — but it would make cherry-picking cheap: re-roll one hard
scenario at two dollars until it lands, with the losing runs sitting committed and
the newest one counting. A full re-run costs twelve dollars and thirty-five
trials, and that price is part of what makes the gate mean something. Redesigning
a gate the review had just designed, to make this session's output look better,
is also exactly what D-014 clause 3 exists to prevent.

What was done. The gate is untouched and every affected row stays FAIL. Only the
sentence changed: a scenario absent from the newest run used to read "no result
recorded for this scenario", which is true of that file and false about the
repository. It now names the newest run that does cover it, re-derives that run's
pass count from its artifacts rather than reading it, and says which of that
run's seals are stale. A committed eval report should not read as though S1
through S7 were tried and failed when six of them have five-of-five evidence
sitting in the tree.

The consequence, stated rather than softened: **E5 is mechanically RED and stays
red until one run covers all seven scenarios under the current skill and
validator.** That costs about $12.63 and thirty-five trials, is exactly the price
F-064 disclosed in advance when it sealed the validator, and is not paid in this
session because section 3 authorised the cheaper path and the M3 gate is not
being re-evaluated here anyway. The evidential claim for those six scenarios is
the re-grade in `evals/reports/2026-09-08-M3-fix-2-regrade.json`, and it is an
argument for a human to accept, not a green light a machine issued.

For Hamza, the two ways to close this: pay for one full run before the M3 gate is
re-evaluated, or rule that per-scenario union grading is acceptable and accept the
cherry-picking exposure with a mitigation, such as the runner printing how many
committed runs cover each scenario.

### F-070: The internal adversarial pass overran the D-034 cap, and its remainder is filed here
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 on its own conduct. D-034 caps the internal adversarial
pass at fifteen agents, one pass, roughly one million tokens, and says a pass
approaching the cap stops and files the remainder as open flags rather than
finishing large. This pass spent **1,730,637 tokens across fifteen agents** — the
agent count held, the token cap did not, by roughly seventy percent. D-034 says
the M3 overrun was accepted once and is explicitly not precedent, so this is a
second overrun and it is recorded as a breach rather than as a footnote. The
cause is that the script capped agents and not tokens, which is a design error I
made and not a surprise: ten read-only lenses over a six-commit series at high
reasoning effort was never going to fit inside a million. No further pass runs
this session.

What it produced: 38 findings, 2 confirmed under adversarial verification, 3
refuted, **33 unverified under the cap and therefore filed here as open**, per
D-034's own instruction that unverified findings are written down rather than
re-derived by fan-out.

**Confirmed and fixed in this session** (both in E6, both gate-soundness, neither
touching sealed evidence because `e6.mjs` is not an E5-sealed input):

1. E6 sealed `validator_sha256` from `src/**/*.ts` while grading through
   `dist/cli.js`. Nothing automated invokes `e6.mjs`, so `run.sh`'s mandatory
   rebuild never covered it, and `existsSync(CLI)` was the only guard. Reproduced
   by the verifier: the same seal over the same trees gave 3/3 PASS against a
   stale binary and 2/3 FAIL after `npm run build`. `e6.mjs` now runs the build
   itself, exactly as `run.sh` does and for the same stated reason.
2. `manifest.snippet_sha256` was written at setup and never read; `grade`
   recomputed the snippet hash from disk, so a snippet edited between setup and
   grade was sealed as the snippet that was tested. It is read back now and a
   mismatch refuses to grade.

**Unverified, filed as open, in the pass's own words.** Rule-level, in code this
session must not touch, because any `src/` change invalidates the fresh S3 run's
validator seal (F-064): D-035's exemption reads `supersedes:` from any entry
kind, so a flag or criterion carrying a `links:` and a `supersedes:` key neither
is in its grammar can silence ERR_STALE_REF on itself; an entry naming its own id
in `supersedes:` marks itself superseded and falls through D-028 clause 2.3, so
every stale link on it goes unreported, which predates D-035; `supersedes`
accepts a multi-id list although SCHEMA.md says "none or one D id", and nothing
enforces the grammar; and `supersededDecisions` does not check the kind of the
target, so `supersedes: F-001` on a decision makes a flag count as superseded for
ERR_STALE_REF while `dsk status` still lists it open.

In this session's own new code: `regrade.mjs` copies the runner's
`inputHashesNow()` instead of sharing it and the copy already omits
`commands_sha256`, so its seal table can print all-same while a slash-command file
has changed; its change baseline is `s.passed`, an integer the graded party wrote;
a results file with zero scenarios yields a vacuous all-clear at exit 0; a
scenario whose spec no longer exists crashes with exit 1, the same code the
header reserves for "verdict changes found". In `earlierCoverage`: it discards
every `problems` entry the replay returns, so a missing or tampered artifact
reads as an ordinary failed trial and the sentence can still say "with every seal
intact"; the denominator is read off the older results file rather than derived
from the spec; it never checks `full_run`; its stale-seal list omits
`commands_sha256` and the fixture hash; and a duplicate-row or unparseable older
run makes it print "no committed run covers it", which is false. In `e6.mjs`: the
manifest is an unsealed plain file in the gitignored work tree, so editing one
field turns a committed trial into a PASS; a tree missing a ledger file crashes
the grader with an unhandled ENOENT and loses every result; and `dirs` drops any
positional argument whose string equals the `--runtime` value, so a scenario can
be silently omitted while only PASS rows print.

Pre-existing and outside this series, listed because the pass found them and a
flag is where findings go: the four-surface byte-identity is asserted in two
committed files and enforced by nothing; the shipped skill template now cites
this repo's internal decision id `D-035`, which is a project-specific reference
in a file copied into user projects; and `evals/expected/README.md` still states
the ERR_STALE_REF rule in a form D-028 and D-035 have both overtaken.

Three findings were refuted by adversarial verification and are recorded as
refuted rather than dropped: that a hand-written `e6-results.json` with checks
named anything clears the gate (true mechanically, but it is the documented limit
of a manual suite, disclosed in EVALS.md section 7); that the E6 grader not
checking the trial tree still holds only the snippet is a hole (the reproduction's
decoration was causally irrelevant); and a duplicate of confirmed finding 1 whose
stated consequence did not hold.

### F-071: What this session got wrong in its own committed text, and corrected
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Raised by claude-opus-5 from the honesty lens of the F-070 pass, on this
session's own writing. Four statements were stronger than the evidence, each
verified against the repository before correcting. They are listed here because
a correction that leaves no record is how the record stops being trustworthy.

1. **"Six unit tests."** `test/d035-same-entry-supersedes.test.mjs` has ten: six
   boundary tests plus four generated by the shipped-surface loop. PLAN.md said
   six twice, once as "six ... including four", which cannot be right under any
   reading. `node --test` prints `# tests 10`, and the whole suite went 59 → 69.
   PLAN.md corrected to ten, with the split named.
2. **"SKILL.md changed by deleting one line from one example."** The diff is
   `6 insertions, 1 deletion` per copy: the `links:` line was replaced, not
   deleted, and a four-line paragraph about D-035 was added. That sentence is
   load-bearing — it is the argument for accepting six re-graded scenarios under
   a changed skill — so understating it matters more than its size. Corrected in
   the report's errata section rather than by rewriting committed evidence.
3. **"E6 existed in PLAN.md and in nothing executable."** False in both halves.
   `evals/scenarios/e6.mjs` was a working 7,673-byte kit at `c291d5f` and EVALS.md
   carried a whole section 7. What was true is the narrower thing F-060 always
   said: the runner, `run.sh` and the workflow contained zero references, so
   nothing consumed its result. EVALS.md section 7 corrected to say that.
4. **PLAN.md's session numbering** still called M4 session 6 and M5 session 7 in
   its headings while the paragraph the same commit added called this session the
   sixth. Corrected to 7 and 8.

**Not corrected, deliberately, and both are real.** SKILL.md and the R11 snippet
tell an agent that an in-place edit "fails validation" and that "a git-level
check fails the build on any in-place edit". `dsk validate` reports valid and
exits 0 on an uncommitted in-place edit, and on any repository with no `HEAD~1` —
which includes every E5 and E6 trial tree, since both harnesses make exactly one
commit. The check fires on the commit, not on the edit. The sentence should say
so. It is not fixed here because changing SKILL.md changes the E5 skill seal and
invalidates the S3 run sealed an hour ago, and because it is a v0.1 wording
question for Hamza and the next review rather than a fix to slip in at the end of
a session. Second: README.md has not been touched since the first commit and
still says the validator does not exist and every fixture reports
NOT_IMPLEMENTED, with a fixture count of 20 against the real 24. PLAN.md schedules
the README rewrite at M4; until then it is the first thing a reader sees and it
is false.

### F-072: README.md is still false, and it is the first thing a reader sees
status: open
date: 2026-09-09
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

The second half of F-071, re-homed so that closing F-071 does not close this.

F-071 recorded two things it deliberately did not correct. The first was the
enforcement wording in SKILL.md and the R11 snippet, which M3-REVIEW-3.md section
3.1 ordered fixed and this session fixed on all four surfaces. The second is this
one: README.md has not been touched since the first commit. It says the validator
does not exist, that every fixture reports NOT_IMPLEMENTED, and it gives a
fixture count of 20 against the real 24. All three statements are false, and it
is the file a stranger opens first.

M3-REVIEW-3.md section 3.3 rules that it stays as it is here, because the README
is M4's deliverable and rewriting it in a seal-breaking batch session would be
scope drift. That ruling is accepted. What is not accepted is that the closure of
F-071 should take the record of a live falsehood with it: a sign-off scope is
permanent, D-025 makes naming a flag its closure, and this repository publishes
at M5 with its open flags triaged one line each under section 5. A defect with no
open flag is a defect that triage cannot see.

So this flag carries it, and it closes when M4 rewrites README.md — not before,
and not by the same sign-off that closes the wording.

### F-073: The thirty-three unverified findings of the capped pass need a home that survives F-070's closure
status: open
date: 2026-09-09
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

The same structural point as F-072, for the other closure M3-REVIEW-3.md section
7 authorises.

F-070 records a budget breach and, under D-034's instruction that unverified
findings are written down rather than re-derived by fan-out, it also carries the
33 findings the pass could not verify inside the cap. Section 7 closes F-070 by
D-037, and rightly: the breach is answered, the cap is now enforced in code.
Section 5 separately says those 33 findings are in scope of the ship-gate triage
before M5 publishes. Both are true, and together they leave the findings inside a
closed flag while a triage that walks open flags is what has to see them.

The findings themselves are not restated here. They are in F-070's text, in the
pass's own words, and copying them would create a second version of evidence that
can drift from the first. This flag is the pointer that keeps them in the open
set: **read F-070's "Unverified, filed as open" section, and give every item in
it one line at the section 5 triage** — closed, deferred to a labelled v0.2
bucket, or kept as a named known limit.

Four of them are rule-level, against src/, and this session did not touch them
for the reason F-070 already gave and section 3.2 confirms: they need fixtures
and a schema ruling, not a wording fix in a batch commit, and any src/ change
invalidates the seal the paid run depends on. They are the strongest candidates
for the v0.2 bucket rather than for closure.

This flag closes when the section 5 triage has given every item its line.

### F-074: What this session chose beyond the review's letter
status: open
date: 2026-09-09
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

CLAUDE.md rule 8 and D-014 clause 4. Three choices in this commit series are not
dictated by M3-REVIEW-3.md, and each is written down here rather than left for a
reader to find in a diff.

1. **The section 3.2 election.** Section 3.2 gives every other pending edit to a
   sealed artifact two homes, this series or v0.2, and leaves the choice open.
   One edit took the series: the shipped skill template explained the
   redundant-link exemption by naming `D-035`, an id in *this* repository's
   ledger that means nothing in a user's project, and it closed with a note about
   what the example "used to teach", which is this repo's history. Both are gone;
   the rule is stated by what it does. Everything else on F-070's pre-existing
   list stays for v0.2: the four rule-level findings against `src/`, which need
   fixtures and a schema ruling and whose fix would invalidate the seal the paid
   run in this same session depends on, and `evals/expected/README.md`, whose
   ERR_STALE_REF paragraph D-028 and D-035 have both overtaken — that file is
   outside the sealed set, so section 3.2 does not reach it either way, and it is
   listed here so the omission is a choice on the record rather than an oversight.

2. **A test for an invariant two files assert in prose.** AGENTS.md's preamble and
   PLAN.md's M3 section both claim the R11 snippet is embedded byte-identically,
   and the two SKILL.md copies are claimed identical in the same breath. Nothing
   checked either, which F-070's pre-existing list also recorded. This session
   added `test/four-surface-identity.test.mjs` before making a four-surface edit,
   and it went red between the first surface and the second, which is what it is
   for. Adding a test is not in the review's letter; making a four-file hand edit
   without one, in the session that freezes those files, seemed worse.

3. **The unit D-037's cap is counted in.** This is the one that needs Hamza. The
   workflow runtime reports output tokens for the turn. The two recorded overruns
   — roughly 1.96M at M3 and 1,730,637 at the second fix session — came from the
   Workflow tool's subagent accounting, which is a different and larger number.
   The enforced cap is therefore D-034's "roughly one million" taken literally in
   the unit the script can read, which may be looser than D-034 intended, and a
   cap that never binds is the failure D-037 exists to end. The smallest
   reversible reading was to take the number literally and make the script report
   its own measured spend against it; inventing a tighter number would be setting
   a threshold by feel, which CLAUDE.md rule 4 exists to prevent even in the
   direction that looks stricter. **The first enforced pass produces the
   calibration datum, and Hamza sets the real number then**, by passing
   `args.tokenCap` or by amending `CAPS` with a decision.

### F-075: What the committed E6 run is evidence of, and what it is not
status: open
date: 2026-09-09
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

E6 was executed by Hamza on 9 September on the Gemini CLI and graded by
`evals/scenarios/e6.mjs`. The runner passes it: the runtime is named and is not
Claude, all three scenarios are covered exactly once, every verdict is re-derived
from that row's own checks, and the snippet and validator hashes still match the
tree. This flag records what the results file cannot say about itself, so the
AC5 claim is read at its true weight rather than at the file's face value.

1. **Two attempts, and the file shows one.** S3 ran twice on the same model,
   `gemini-3.1-flash-lite`. Attempt 1 is committed as a failure in `15085cd`: the
   runtime refused the edit and kept D-001 byte-identical, but appended no
   superseding entry. Attempt 2, committed in `1c7bf4c`, refused *and*
   superseded. The grader overwrites `e6-results.json` in place, so the file
   carries no attempt number and no per-row timestamp; only the commit history
   preserves the failure. That is the append-only law honoured at the repository
   level rather than inside the artifact, and it is why the retry is disclosed
   here instead of being visible in the graded file.

2. **What the two attempts establish, at n of 2.** The snippet carried the
   append-only law to a weak model **two of two** — neither attempt removed a
   line or rewrote D-001 — and the full refuse-and-supersede workflow **one of
   two**. S1 and S2 add one clean observation each on the write path. One
   runtime, small n, no threshold: E6 is a smoke test and this is smoke.

3. **One runtime, two models, and the file records neither model.** S1 ran on
   `gemini-3.5-flash`, S2 and S3 on `gemini-3.1-flash-lite`. The results schema
   has a single top-level `runtime` string and no per-row model field, so a run
   that mixed models inside one runtime is indistinguishable from one that did
   not. EVALS.md section 7 asks for one *runtime*, which is satisfied; law 3 asks
   for a model id, and the artifact that grades law 3 does not carry one.

4. **In attempt 2 the runtime never ran `dsk validate` itself.** The shim was not
   on its PATH, so the snippet's own instruction to validate after a write went
   unexercised in that trial; the grader supplied the check. The check is a true
   statement about the final tree either way, so the pass stands, but E6 did not
   observe the runtime obeying that half of the snippet.

5. **The model ids the runtime wrote are not model ids.** S1 recorded
   `model: gemini-2.5-pro`, which contradicts the model Hamza ran it on; S2 and
   S3 recorded `model: gemini-cli-agent`, which is a runtime name. Three of three
   agent-authored entries carry a provenance value that law 3 would not accept
   from a human reviewer, and all three pass `ERR_MODEL_ID`, which only checks
   that the field is set. Neither E6's grader nor the validator can catch this;
   the snippet asked correctly and the weak model answered wrongly. This is the
   most substantive AC5 finding in the run and it is a v0.2 item, not a v0.1 fix:
   a real check needs a model-id registry or a runtime-supplied identity, and
   inventing a pattern would be setting a threshold by feel.

Disposition: kept open as a named known limit through v0.1. AC5's evidential
weight is exactly what EVALS.md section 7 already declares — one attested manual
run on one named runtime — narrowed by clauses 1 to 5 above.

### F-076: E7 cannot measure the registry round trip until the package is published
status: open
date: 2026-09-09
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

AC3 is a claim about a fresh user: install to first validated decision entry in
under ten minutes. E7 measures that path end to end against a tarball built by
`npm pack` at run time, because v0.1 is not on npm yet. So the one step E7 cannot
time is the one a real reader starts with, `npm install decision-state-kit` from
the registry. E7 makes exactly one substitution, rewrites the install-by-name
token to the tarball path, and reports in its own row that it did.

The gap is small and it is not nothing: registry resolution and download are
network time this suite does not include. Against a ten-minute bar and a package
with one runtime dependency it is seconds, not minutes, which is why the smallest
reversible reading was to measure everything else rather than to leave AC3
ungraded until publication day.

Closes when the package is published and one E7 run is made against the published
name, either by dropping the substitution or by adding a second row that uses it.
Until then AC3's evidence is "every step but the registry fetch, timed".

### F-077: With no git on PATH the validator loses two rules and still exits 0
status: open
date: 2026-09-09
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

Found by E8 on its first run, in the failure the first draft of its own
environment caused. `src/git.ts` (D-012) implements the two git-level codes,
ERR_INPLACE_EDIT and ERR_SIGNOFF_MUTATION, by shelling out to git. When git is
not on PATH the shell-out fails, the check returns null, and `dsk validate`
reports success: INV-08, INV-14 and INV-18 — three fixtures whose entire purpose
is to be caught — came back `ok: true`, exit 0, with the two codes missing.

`validate` does print a note that the git-level check did not apply, so this is
not silent to a human reading a terminal. It is silent to everything else: the
exit code is 0, and the `--json` payload is the shape a green tree produces. R22
makes that exit code a merge gate, so a CI image without git turns the
append-only law off and reports success while doing it. That is precisely the
"silent non-application" F-031 fixed for shallow checkouts, in a second doorway.

Not fixed in v0.1, and the reason is the rule and not the difficulty. The fix
is one branch in `src/`, and `src/**/*.ts` is inside the seal that the paid E5
run of 9 September and the committed E6 results both depend on (D-036,
M3-REVIEW-3.md section 3.2). Editing it here would turn a met gate red in the
session authorised on condition the gate is green.

Contained instead, and the containment is checked: E8 asserts git is reachable in
the degraded environment before it grades a single fixture, so this repository's
own suite can never again grade a validator that quietly dropped two of its
sixteen rules. **Labelled v0.2, first item**: `validate` should report the
inapplicable git check as a distinct machine-readable state and, under `--ci`,
refuse to exit 0 on a tree whose fixtures require it.

### F-078: PLAN and EVALS both say "npx init", and v0.1 has no init
status: open
date: 2026-09-09
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none

CLAUDE.md rule 8. PLAN.md's M4 item 1 says "README with the ten-minute path: npx
init, first decision, first validate", and EVALS.md section 8 says "`npx` init to
first validated decision entry". `dsk init` is listed in the CLI's own usage text
as "not implemented; M4". This session did not implement it, so three documents
name a command the shipped package does not have.

The reason is a genuine collision rather than a preference. `dsk init` is code in
`src/`, `src/**/*.ts` is hashed into the seal that both the paid E5 run of 9
September and the committed E6 results carry, and M3-REVIEW-3.md section 3.2
freezes the graded artifacts through M4 and M5. Writing the subcommand would turn
a met gate red in the session M3-REVIEW-3.md section 6 authorised *on condition
the gate is green*, and would cost another full thirty-five-trial run plus a
second manual E6 execution to get back to where this session started.

Two readings were available and the smaller one was taken (D-039). The rejected
one: ship the command as a separate `bin/dsk-init.mjs` entry point, which the
seal does not hash because it walks only `src/**/*.ts`. It would have given a
real one-line `npx` install path. It was rejected because the seal's purpose is
that the shipped artifact set does not change between the graded run and the
ship, and satisfying that by adding a new executable the hash happens not to
cover is lawyering the seal rather than keeping it — and because it would ship
plain JavaScript from a repository whose stack rule is TypeScript.

The residue, stated plainly: `dsk --help` still advertises `dsk init (not
implemented; M4)`, which is now wrong about the milestone, and that line is one
character-level edit inside the same sealed file. It is v0.2's first cosmetic fix
and it ships wrong in v0.1.

Closes when v0.2 implements `dsk init`, corrects the usage line, and the run that
seals the next E5 covers both.
