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
