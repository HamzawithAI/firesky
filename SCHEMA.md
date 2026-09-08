# SCHEMA-DRAFT.md, frozen 7 Sep (D8)

M0 promotes this file verbatim to SCHEMA.md. The builder transcribes, it does not invent. Any gap found here becomes an F flag, not an improvisation.

## 0. Amendments after the verbatim promotion

The two lines above record how this file arrived: SCHEMA-DRAFT.md was promoted
byte-identical at M0 (D-008), and SCHEMA-DRAFT.md remains frozen at that text.
What follows below has since been amended by the D14.3 external review recorded
in M0-REVIEW.md and locked by D-021 and D-022. Every amendment is listed here so
the diff against SCHEMA-DRAFT.md is never a surprise:

1. **D-021, supersession by derivation** (M0-REVIEW section 3). The decision
   status vocabulary is `proposed` and `locked` only; `superseded-by:` is gone.
   An entry is superseded if and only if a later entry names it in `supersedes:`.
   Sections 2 and 3 below carry the change.
2. **ERR_STALE_REF redefined** (M0-REVIEW 3.2). It governs `links` and `scope`
   members only, and superseded-ness is computed by derivation. Section 3.
3. **Git-level checks stated, and the whitelist removed** (M0-REVIEW 3.5,
   closing F-020). Section 2.
4. **The flag grammar gains `model:`** (M0-REVIEW 4.4, closing F-013 and F-018).
   Section 2.
5. **ERR_LINK and ERR_SCOPE split by field** (M0-REVIEW 4.3, closing F-007).
   Section 3.
6. **ERR_PROVENANCE defined** (M0-REVIEW 4.5, closing F-019). Section 2.
7. **The fixture-to-code mapping is many-to-one** (M0-REVIEW 4.2, closing
   F-006). Section 6.
8. **D-022**: R19's "no orphan flags" clause is cut for v0.1 as unenforceable
   under this grammar. No code is minted for it. Section 6.
9. **D-024, the dated grandfather for the flag `model:` field** (M1-REVIEW 2.2,
   resolving F-030). The requirement applies to flag entries dated
   `MODEL_FIELD_SINCE` or later only. Section 2.
10. **The ERR_MODEL_ID precondition made real** (F-035). The code is suppressed
    whenever the entry has no provenance block, which is what section 2 already
    said and the implementation only half did. Section 2.
11. **D-025, flag resolution by derivation** (M1-REVIEW 2.3, resolving F-025).
    A flag is resolved if and only if a sign-off names it in scope. Section 2.
12. **The preamble rule** (M1-REVIEW 2.4, on F-029). Full-file immutability
    stands with no region carve-outs, and a preamble carries only timeless text.
    Section 2.
13. **D-028, sign-offs are attestations of a moment** (M2-REVIEW.md section 2,
    resolving F-036). ERR_STALE_REF is narrowed: sign-off `scope` is exempt from
    it forever, criterion `scope` becomes a report warning rather than an error,
    and `links` fires only on an entry that is itself current. Sections 2 and 3.
14. **D-027, criteria resolution by derivation** (M2-REVIEW.md section 2.4). A
    criterion is met if and only if a sign-off names it in `scope:`. Its own
    `status:` becomes advisory, exactly as D-025 made flag status advisory.
    Section 2.
15. **D-030, `raised-by` records the composing writer** (M3-REVIEW.md section 2,
    closing the root cause of F-058). The field records whose act wrote the
    entry, exactly as `author` does on a decision. Section 2.
16. **D-033, a repeated key inside one entry is an error** (M3-REVIEW.md section
    5, closing the F-052 close call structurally). New code ERR_DUP_KEY, new
    fixture INV-19. The inventory becomes sixteen codes. Sections 2 and 6.

## 1. Files

`state/` contains exactly: `decisions.md`, `flags.md`, `criteria.md`, `signoffs.md` (four ledgers, D9 amends R1), and `state.yaml`.

## 2. Entry grammar (line-oriented, one grammar for all ledgers)

An entry is: one heading line, then `key: value` lines until a blank line, then optional prose until the next heading or end of file. Parsing is line-oriented, no markdown AST (D10).

Decision entry, decisions.md:

```
### D-001: Use TypeScript for the package
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#6.1]
supersedes: none

Rationale prose, five lines maximum.
```

Field rules: `status` is one of `proposed`, `locked` (D-021; `superseded-by:` is
removed from the vocabulary and any other status word is ERR_STATUS). `author`
is `human` or `agent`. `model` is required and non-none when author is agent
(ERR_MODEL_ID). `supersedes` is `none` or one D id. Rationale over five lines is
ERR_RATIONALE.

Supersession is derived, never declared on the superseded entry (D-021): a
decision is superseded if and only if some later decision names it in its
`supersedes:` field. `dsk status`, `render` and the validator compute
current-ness from those pointers. This is what makes every valid supersede chain
reachable by appends alone, with no sanctioned mutation anywhere.

Flag entry, flags.md:

```
### F-001: Confirm metric numbers
status: open
date: 2026-09-07
owner: hamza
raised-by: human
model: none
resolution: none
```

`status` is `open` or `resolved`. A resolved flag with `resolution: none` is
ERR_RESOLUTION. `owner` missing or empty is ERR_OWNER. `raised-by` is `human` or
`agent`. `model` carries the same rule as on decisions: required and non-none
when `raised-by` is agent, enforced by ERR_MODEL_ID (D-021 amendment 4, closing
F-013 and F-018).

**Whose act `raised-by` records (D-030, ruled by M3-REVIEW.md section 2).**
`raised-by` records the actor that composed the entry and wrote it into the
ledger, exactly as `author` does on a decision. An agent that composes a flag on
a human's instruction writes `raised-by: agent` and carries its own model id: the
instruction is the flag's subject, not its authorship, and law 3 exists so that
agent-written context is visible as such. A human who wants human provenance
types the entry personally. The field records the writing, never the prompting,
and there is no third value for "a human asked and an agent wrote". Until this
sentence existed the same skill produced opposite provenance for the same task
inside one E5 run, three trials to two, with no check anywhere that could see it
(F-058). The three misrecorded trial artifacts stay committed as history.

    MODEL_FIELD_SINCE: 2026-09-08

The `model:` requirement on flag entries applies only to entries dated
`MODEL_FIELD_SINCE` or later (D-024, ruled by M1-REVIEW.md section 2.2 to
resolve F-030). A flag dated earlier was lawfully written before the field
existed, D-021 forbids editing it, and flags carry no `supersedes:` field to
append a correction through (F-025), so no legal in-schema fix exists for it.
The rule is deliberately flag-only: decisions carried `model:` from the
promotion, so the grounds for grandfathering hold for no decision anywhere.
Known limit, accepted for v0.1: a backdated entry dodges the rule, and the git
record makes that visible without the validator enforcing it. Dates are ISO, so
the comparison is a string comparison, with no clock read and no arithmetic. A
flag whose date is absent or non-ISO is not dated `MODEL_FIELD_SINCE` or later
and is out of the rule's reach; it is already ERR_PROVENANCE or ERR_DATE, so no
green tree is reachable through that door.

Resolution is derived, the same way supersession is (D-025, ruled by
M1-REVIEW.md section 2.3 to resolve F-025): a flag is resolved if and only if a
sign-off names it in its `scope:`, and that sign-off's prose carries the
resolution note. The flag entry's own `status:` and `resolution:` fields are
advisory, correct at write time and never afterwards, because D-021 forbids
editing a committed ledger line and so no status word can ever move. The derived
answer is the authoritative one everywhere it is shown: `dsk status`, `render`,
and validator reporting. This is why F-005 to F-024 read `status: open` while
S-003 closed them, and why nothing needs to be edited to make that true.

ERR_RESOLUTION is unchanged and still fires on a flag written as `resolved` with
`resolution: none`: the fields remain part of the grammar, so a self-contradictory
one is still malformed at write time. Removing the advisory fields and retiring
INV-10 is a grammar change, explicitly deferred to v0.2 by the same ruling. No
fixture changes here.

Criterion entry, criteria.md:

```
### AC-001: Validator catches all seeded errors
status: open
scope: [D-003]
```

`status` is `open`, `met`, or `dropped`.

Criteria derive their status the way decisions derive supersession and flags
derive resolution (D-027, ruled by M2-REVIEW.md section 2.4): **a criterion is
met if and only if a sign-off names it in its `scope:`**. The criterion's own
`status:` field is advisory, correct at write time and never afterwards, for the
same reason a flag's is — D-021 forbids editing a committed ledger line, so no
status word can ever move. The derived answer is the authoritative one wherever
it is shown: `dsk status`, `render`, and validator reporting.

The derivation has exactly two outcomes, met and open. `dropped` stays
advisory-only in v0.1 by the same ruling: it carries no derivation, so a
criterion written `dropped` that no sign-off names derives as open, with the
written word displayed beside the derived one rather than acted on (F-050).
Removing the advisory field is a grammar change, deferred to v0.2 alongside the
same cleanup on flags. No fixture changes here.

Sign-off entry, signoffs.md:

```
### S-001
actor: hamza
role: owner
date: 2026-09-21
scope: [D-003, AC-001]
```

Sign-offs are append-only entries. Any commit that modifies an existing sign-off entry is ERR_SIGNOFF_MUTATION (git-level check, D12).

Git-level checks in general (D12, and M0-REVIEW 3.5 closing F-020): any change
to a line already committed in a ledger file is a violation. There is no
whitelist and no exception, including for a status transition. On
`state/signoffs.md` the code is ERR_SIGNOFF_MUTATION; on `decisions.md`,
`flags.md` and `criteria.md` it is ERR_INPLACE_EDIT. Exactly one of the two
fires for any one file, so the codes are disjoint by file.

Preambles (M1-REVIEW.md section 2.4, ruling on F-029). The git-level check
protects every line of a ledger file, the preamble above the first `### `
heading included. Full-file immutability stands and there is no region carve-out
in the check, because a carve-out is a tamper surface and D-020 exists to close
those. The consequence is a writing rule, not a code path: **a ledger preamble
carries only timeless text and never a claim about state.** "Sign-offs are
append-only entries" is timeless and legal; "no sign-off has been appended yet"
is a state claim and becomes false the moment one is. The parser ignores
preambles entirely (F-010), so nothing here is validated; it is a rule for
whoever writes the file. `state/signoffs.md` in this repository opens with one
such false line, written before three sign-offs were appended. It is
acknowledged as a historical artifact and left in place, because correcting it
would be exactly the in-place edit the rule forbids.

Provenance (ERR_PROVENANCE, M0-REVIEW 4.5 closing F-019): an entry has no
provenance block when its `author` is missing or is not `human` or `agent`, or
when its `date` is absent. The rule is applied per entry type, to the fields that
type's grammar defines: `author` and `date` on decisions, `raised-by` and `date`
on flags, `date` on sign-offs. Criterion entries carry neither field and are out
of scope. ERR_DATE remains distinct: the date is present but is not ISO format.
ERR_MODEL_ID cannot fire on an entry that already has no provenance block. That
is a precondition of the code, not a consequence of its author test: an
agent-authored entry with no `date` has no provenance block by the clause above,
and the implementation checked only the author half of the definition until
F-035. The two rules now read one shared predicate.

## 3. IDs, dates, links

IDs match `D-`, `F-`, `S-`, or `AC-` plus exactly three digits, zero-padded, permanent, never reused (violation: ERR_ID_GRAMMAR, duplicates: ERR_DUP_ID). Dates are ISO `YYYY-MM-DD` (ERR_DATE). `links` and `scope` are bracketed comma lists whose ID members must resolve within `state/`: an unresolved member of a `links` field is ERR_LINK, and of a `scope` field is ERR_SCOPE (M0-REVIEW 4.3, closing F-007).

ERR_STALE_REF (M0-REVIEW 3.2, resolving F-015 and F-016; narrowed by D-028,
M2-REVIEW.md section 2, resolving F-036) never governs the `supersedes` field. A
decision naming its predecessor in `supersedes:` is always legal, which is the
whole point of the derivation. Superseded-ness is derived from the `supersedes:`
pointers of later entries per section 2.

As M0-REVIEW 3.2 first defined it, the code governed every `links` and `scope`
member of every entry, and F-036 found that this made supersession — the one
legal correction this schema has — permanently invalidate the tree: supersede a
decision that a sign-off names in `scope` and that sign-off is red forever, since
a sign-off can neither be edited (D12, law 4) nor un-scoped. D-028 narrows the
code to the one place a stale reference actually misleads.

1. **Sign-off `scope` is exempt, permanently.** A sign-off records approval of an
   entry as it stood at that time, and a later supersession does not falsify
   history. ERR_SCOPE still applies to sign-offs in full: every scoped id must
   resolve. The exemption is from staleness, never from existence.
2. **Criterion `scope` is not an error.** A criterion whose `scope` names a
   superseded decision is reported as a warning in the staleness report, and
   surfaced by `dsk status` and `render`. It mints no code, so the inventory
   stays at fifteen. The signal survives, the brick does not.
3. **`links` fires, on current entries only.** It is a hard error when a `links`
   member of an entry that is **not itself superseded** resolves to a superseded
   decision. An entry that has been superseded is history, and history may point
   at history — which is what finally gives a stale `links` an append-only
   remedy: supersede the entry that carries it.

## 4. state.yaml

```
schema: "0.1"
project: dsk
created: 2026-09-07
staleness_days: 30
```

Missing `schema` is ERR_SCHEMA_VERSION. `staleness_days` feeds R20, overridable per run, clock injected via `DSK_NOW` in tests.

## 5. Validator JSON contract (dsk validate --json)

```
{
  "ok": false,
  "errors": [
    {"code": "ERR_OWNER", "file": "state/flags.md", "id": "F-004", "line": 31, "message": "flag has no owner"}
  ],
  "counts": {"decisions": 12, "flags": 4, "criteria": 6, "signoffs": 2}
}
```

Exit code 0 only when `ok` is true. Error codes are frozen at M0 and never renamed (E2 depends on them).

## 6. Error code inventory

ERR_OWNER, ERR_DUP_ID, ERR_STATUS, ERR_STALE_REF, ERR_LINK, ERR_PROVENANCE, ERR_MODEL_ID, ERR_SIGNOFF_MUTATION, ERR_RESOLUTION, ERR_ID_GRAMMAR, ERR_SCHEMA_VERSION, ERR_DATE, ERR_INPLACE_EDIT, ERR_RATIONALE, ERR_SCOPE. Each code is one rule module with its own fixture pair (D11). The mapping between INV fixtures in EVALS.md section 3 and these codes is many-to-one (M0-REVIEW 4.2, closing F-006): every code has at least one fixture, and every invalid fixture expects exactly one code. ERR_OWNER and ERR_MODEL_ID each carry two fixtures.

Fifteen codes, and the count is frozen. R19's "no orphan flags" clause carries no
code and is cut for v0.1 as unenforceable under this grammar (D-022, M0-REVIEW
4.7). An optional `links` field on flags is deferred; P7 governs.
