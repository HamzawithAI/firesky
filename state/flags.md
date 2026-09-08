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
