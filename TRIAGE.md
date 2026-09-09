# TRIAGE.md, the ship gate's flag triage

M3-REVIEW-3.md section 5: "Before M5 publishes, every open flag receives one
line: closed, deferred to a labelled v0.2 bucket, or kept open as a named known
limit. Publishing with a silent backlog is not an option, publishing with a named
one is."

Forty were open when this session started. It closed two (F-054 and F-074, by
S-014) and raised four (F-075 to F-078), leaving **forty-two open** when this
triage was taken. All forty-two have a line below, and F-074 is listed with them
because it closed today rather than before today — forty-three rows, twenty-six
of them closed, twenty-five of those by S-015 and F-074 by S-014.

**How to read it.** Nothing here edits a flag; D-021 forbids that and the ledger
is append-only. A flag's *derived* status changes when a sign-off names it
(D-025), so the closures below are made by **S-015** in `state/signoffs.md` and
this file is the reasoning behind that entry, not a second source of truth. Run
`dsk status .` for the authoritative list.

Three dispositions, and they mean exactly this:

- **Closed** — the state the flag described no longer exists, and the evidence
  that it no longer exists is named on the line.
- **v0.2** — real, unfixed, and deliberately not fixed in v0.1. Every one carries
  why. Collected in section 2 in the order they should be taken.
- **Known limit** — kept open on purpose, because it is a true statement about
  what this kit does not do or a question that is Hamza's to answer, not the
  builder's. Collected in section 3, and the honest ones are in the README.

## 1. Every open flag, one line

| Flag | Disposition | Line |
|---|---|---|
| F-001 July post status and resonance numbers | known limit | Hamza's input, not the build's. K1 and K2 govern the kill lines regardless of when it lands. |
| F-002 build start against the MARSAD gate | closed | Closed by Hamza's explicit call on 7 Sep, recorded in PROJECT.md section 12; the entry says `resolved` and no sign-off had ever named it. |
| F-003 metric numbers for 8.3 and 8.4 | known limit | Hamza's numbers. EVALS.md section 10's defaults apply until replaced and are what `state/metrics.md` measures against from today. |
| F-004 confirm or resize the Tier M box | closed | Closed by default on 7 Sep at six sessions, then consciously resized to eight by F-065, which is itself closed. This is session eight. |
| F-023 transcription losses from the PROJECT.md migration | known limit | The three dropped details live in the flag and nowhere else; D-021 forbids editing the ledger to restore them. Recorded, not repaired, on purpose. |
| F-026 a dangling `supersedes:` target is ungoverned | **v0.2** | Re-verified today: a decision with `supersedes: D-777` validates green and exits 0. No rule governs the field. |
| F-027 ERR_PROVENANCE would fire on criteria and sign-offs | closed | Fixed in `src/rules/helpers.ts`, which derives the provenance block per entry kind and cites F-027 at the line that does it. |
| F-028 two milestones in one session | closed | Disclosed twice and authorised twice: M0 plus its review, and M4 plus M5 here under M3-REVIEW-3.md section 6. The clause was never quietly broken. |
| F-031 six implementation readings SCHEMA.md does not fix | known limit | All six shipped as decided and each is cited in the code that implements it. Each is a one-line reversal if Hamza rules otherwise; he never was asked to. |
| F-034 INV-17 past the D-024 cutoff, green side has no slot | **v0.2** | Needs a fixture the frozen M0 inventory has no home for. Fixture-inventory work, batched with F-049. |
| F-035 ERR_MODEL_ID fires where SCHEMA.md says it cannot | closed | Fixed at M1; the rule shares one predicate with ERR_PROVENANCE precisely so the two cannot drift again. |
| F-037 the append-only check is a byte prefix, so law 5 can be defeated | closed | Fixed: `src/git.ts` compares line-aware, `head.startsWith(base + "\n")`, and the comment names F-037 at the fix. |
| F-038 the F-035 fix covered half its own defect | closed | Fixed: `provenanceOf` treats an empty `date:` as absent, and says so citing F-038. |
| F-039 the harness and CI gate less than the documents claim | closed | All four gaps closed: unit tests run in CI, a failed build is fatal and writes no report, E5 gating expired into the exit code, E6 entered it. |
| F-041 the four M1 findings dropped at the cap | known limit | Discharged as far as it can be — they exist in no artifact — and its standing ask remains open: a build-protocol rule that a pass commits its candidate list before triage. That is Hamza's to make, not the builder's. |
| F-044 R20's owner-set date has no field in the flag grammar | **v0.2** | A schema addition, and the schema is frozen for v0.1 (D-008). Staleness reports entries, never owner-set flag dates. |
| F-045 E4 was specified without a fixture or a window | closed | EVALS.md section 5 now names VAL-04, the clock and the three windows, and the runner derives all four from that sentence rather than from a list. |
| F-046 the staleness and render command names were the builder's choice | closed | Both names shipped, are in SCHEMA.md's JSON contract, the README and the Action, and nothing has asked to change them. |
| F-047 the M2 gate's last clause needs an admin | known limit | Its trigger is publication, which is paused for Hamza's word. Section 4 below is the checklist that fires with it; until then CI on every push carries the gate in spirit. |
| F-048 INV-18 was green on arrival | closed | Disclosure, accepted; the same precedent is what E8 cites for itself today. |
| F-049 the F-036 ruling's own cases have no fixture home | **v0.2** | Fixture-inventory work, batched with F-034. |
| F-050 two readings the F-036 ruling left to the builder | closed | Disclosure under CLAUDE.md rule 8; both readings shipped and neither was disputed by the two reviews that followed. |
| F-051 S-005's scope needed two judgment calls | closed | Disclosure, accepted by M3-REVIEW.md, which reviewed the session that made them. |
| F-053 an ad-hoc eval report reached the committed trail | known limit | Three `-adhoc.md` reports are committed. Contained rather than removed: the runner names an unlabelled run `adhoc` and never a milestone, so no ad-hoc report can be mistaken for a gate report. |
| F-055 the E5 gate trusts a file the graded party writes | known limit | Permanent and stated as such in EVALS.md section 6. D-032 made forgery expensive by re-deriving every verdict from committed diffs; full non-forgeability needs trusted execution and is out of scope. |
| F-056 the first M3 pass died on a usage limit and spent budget | closed | D-034 settled the accounting (a killed attempt is spend, not a pass) and D-037 made the cap a check rather than a wish. |
| F-057 two hard 5-of-5 gates passed against an agent that does nothing | closed | Fixed by D-031: S4 and S7 are paired actions, so a null agent fails the benign leg. |
| F-058 the skill produced opposite provenance for the same task | closed | Fixed by D-030 in SCHEMA.md and SKILL.md, with the assertion added to S2's grader. |
| F-059 the gate graded one self-reported integer | closed | Fixed by D-032: every count is re-derived from committed artifacts and the file's own integers are compared, never used. |
| F-060 E6 had no gate anywhere | closed | Fixed at session six: E6 is in the runner, in `run.sh` and in CI, and an absent results file is a FAIL. |
| F-061 the E5 evidence was untracked and nearly destroyed | closed | Fixed by D-032: timestamped run files that are never overwritten, with per-trial artifacts committed beside them. |
| F-062 the snippet gained a rule the review did not name | closed | Disclosure, accepted; the rule it added is the one D-030 requires and E6 exercised it three times. |
| F-063 D-031 rewrote two scenario specs | closed | Disclosure under D-014 clause 4, accepted by the review that ordered the redesign. |
| F-064 the tamper seal covers the validator, and that has a price | closed | The price was named at $12.63 and then actually paid on 9 Sep. D-036 makes it a standing cost, and F-078 is what that cost bought in scope. |
| F-067 VAL-02 gains two entries | closed | Disclosure, accepted by M3-REVIEW-2.md section 2.3, which asked for the pattern to be pinned. |
| F-068 E6's three grader holes closed in the same commit | closed | Disclosure, accepted; the holes were closed before E6 ever gated anything, and today's run went through the closed grader. |
| F-072 README.md is still false | closed | Rewritten today, and now graded: E7 runs the README's own ten-minute path in a fresh directory on every CI run, so it cannot drift back. |
| F-073 thirty-three unverified findings of the capped pass | **v0.2** | Real backlog, named rather than dropped. They live in F-070's list and none has been verified or refuted. |
| F-074 what session seven chose beyond the review's letter | closed | Clause 3 ruled by Hamza and locked as D-038; clauses 1 and 2 accepted as disclosure. Clause 1's residue is in the v0.2 bucket. |
| F-075 what the E6 run is and is not evidence of | known limit | AC5's weight is one manual run on one runtime, narrowed by five clauses. Clause 5, a model id that is not one, is in the v0.2 bucket. |
| F-076 E7 cannot measure the registry round trip | known limit | Closes at publication, not before. Every other step of the ten-minute path is timed. |
| F-077 no git means two rules report nothing and validate exits 0 | **v0.2, first** | The fix is one branch inside the seal this session's green gate depends on. Contained today: E8 asserts git is reachable before it grades anything. |
| F-078 PLAN and EVALS say "npx init" and v0.1 has none | **v0.2** | The collision and the rejected alternative are in the flag; `dsk --help` ships one wrong line as a result. |

## 2. The v0.2 bucket, in order

1. **F-077** — `validate` reports the inapplicable git check as a distinct
   machine-readable state, and `--ci` refuses to exit 0 where the append-only
   check could not run. This is the one with a merge gate behind it.
2. **F-026** — govern `supersedes:`. A dangling target is currently green.
3. **F-078 and D-039** — `dsk init`, and the usage line that still reads "not
   implemented; M4".
4. **F-075 clause 5** — a `model:` value that is not a model id passes
   ERR_MODEL_ID. Needs a registry or a runtime-supplied identity; a regex would
   be a threshold set by feel.
5. **F-044** — the owner-set flag date R20 already names.
6. **F-034 and F-049** — the fixture slots the frozen inventory has no home for.
7. **F-073** — the thirty-three unverified findings, verified or refuted one by
   one under an enforced budget (D-037).
8. **F-074 clause 1's residue** — the four rule-level findings against `src/`,
   and `evals/expected/README.md`, whose ERR_STALE_REF paragraph D-028 and D-035
   have both overtaken.

Everything in this bucket needs a change inside the M3 seal, a schema change, or
a fixture-inventory change, and all three were frozen for v0.1 by decision rather
than by neglect (D-008, D-036, M3-REVIEW-3.md section 3.2).

## 3. Known limits carried into v0.1

The four a user meets are in the README. The full list: F-001 and F-003 are
Hamza's inputs; F-023 is a recorded transcription loss; F-031 is six shipped
readings the schema does not fix; F-041 asks for a build-protocol rule only
Hamza can make; F-047 is armed and waiting on publication; F-053 is contained by
naming; F-055 is the permanent honest statement of what an eval gate can prove
about the party it grades; F-075 and F-076 bound what AC5 and AC3 established.

## 4. What fires when the repo goes public (F-047)

Deferred by M2-REVIEW.md section 4 with a trigger, not dropped. On publication:

1. The workflow switches to branches plus pull requests.
2. The eval check becomes a **required** status check on `main`.
3. Hamza's ten-minute review happens on the pull request itself.

All three need repository-admin rights and a public repository, which is why they
are Hamza's steps and not this session's. Until they are taken, the difference
between "the Action validates this repository" and "the Action gates this
repository's merges" is real and is recorded here rather than glossed.
