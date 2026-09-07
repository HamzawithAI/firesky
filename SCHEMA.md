# SCHEMA-DRAFT.md, frozen 7 Sep (D8)

M0 promotes this file verbatim to SCHEMA.md. The builder transcribes, it does not invent. Any gap found here becomes an F flag, not an improvisation.

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

Field rules: `status` is one of `proposed`, `locked`, `superseded-by:D-###`. `author` is `human` or `agent`. `model` is required and non-none when author is agent (ERR_MODEL_ID). `supersedes` is `none` or one D id. Rationale over five lines is ERR_RATIONALE.

Flag entry, flags.md:

```
### F-001: Confirm metric numbers
status: open
date: 2026-09-07
owner: hamza
raised-by: human
resolution: none
```

`status` is `open` or `resolved`. A resolved flag with `resolution: none` is ERR_RESOLUTION. `owner` missing or empty is ERR_OWNER.

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

## 3. IDs, dates, links

IDs match `D-`, `F-`, `S-`, or `AC-` plus exactly three digits, zero-padded, permanent, never reused (violation: ERR_ID_GRAMMAR, duplicates: ERR_DUP_ID). Dates are ISO `YYYY-MM-DD` (ERR_DATE). `links` and `scope` are bracketed comma lists whose ID members must resolve within `state/` (ERR_LINK). A `superseded-by` target must exist, and a decision referenced by any current entry must not itself be superseded (ERR_STALE_REF).

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

ERR_OWNER, ERR_DUP_ID, ERR_STATUS, ERR_STALE_REF, ERR_LINK, ERR_PROVENANCE, ERR_MODEL_ID, ERR_SIGNOFF_MUTATION, ERR_RESOLUTION, ERR_ID_GRAMMAR, ERR_SCHEMA_VERSION, ERR_DATE, ERR_INPLACE_EDIT, ERR_RATIONALE, ERR_SCOPE. Each code is one rule module with its own fixture pair (D11). INV fixtures in EVALS.md section 3 map onto these codes one to one at M0.
