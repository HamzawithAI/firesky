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

Criterion entry, criteria.md:

```
### AC-001: Validator catches all seeded errors
status: open
scope: [D-003]
```

`status` is `open`, `met`, or `dropped`.

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

ERR_STALE_REF (M0-REVIEW 3.2, resolving F-015 and F-016) governs `links` and
`scope` members only, and never the `supersedes` field. It fires when a `links`
or `scope` member resolves to a decision that is superseded, where superseded-ness
is derived from the `supersedes:` pointers of later entries per section 2. A
decision naming its predecessor in `supersedes:` is therefore always legal, which
is the whole point of the derivation.

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
