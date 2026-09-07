# Expected outputs

One JSON file per fixture, matching the validator contract in SCHEMA.md
section 5. Written at M0, before any validator code exists (D-007). These files
are the specification the M1 validator is built against, not a recording of
what it happens to produce.

**Do not edit a file here to make a run pass.** A failing eval is a report
(CLAUDE.md, D-014 clause 4). A legitimate change needs an F flag with rationale
in the same commit.

Amended after the D14.3 external review (M0-REVIEW.md, locked by D-021 and
D-022). What changed: the supersede-transition exception is gone, ERR_LINK and
ERR_SCOPE split by field, ERR_PROVENANCE gained a real definition, the flag
grammar gained `model:`, and VAL-05 joined INV-08 and INV-14 as a two-commit
fixture.

## Comparison predicate (F-008, closed by M0-REVIEW 4.1)

| Field | Asserted | Notes |
|---|---|---|
| `ok` | yes | |
| `errors[].code` | yes | Frozen at M0, never renamed (EVALS.md section 4.1) |
| `errors[].file` | yes | Path relative to the fixture root |
| `errors[].id` | yes | The entry that **carries** the violation, not the entry referenced by it. `null` for whole-file errors |
| `errors[].line` | yes | The entry's `### ` heading line. `1` for whole-file errors such as ERR_SCHEMA_VERSION |
| `errors[].message` | no | Human-facing prose, free to improve without touching fixtures |
| `counts` | yes | Entries parsed per ledger, counted even when the entry is malformed |
| process exit code | yes | 0 for VAL, 1 for INV (D-018). SCHEMA.md section 5 ties exit 0 to `ok`; without it a validator that always exits 0 passes E2. Added by F-021 |
| error order | no | Compared as a set |

## Derived rules the fixtures depend on

1. **Supersession is derived, never declared** (D-021, M0-REVIEW section 3). A
   decision is superseded if and only if a later decision names it in
   `supersedes:`. The status vocabulary is `proposed` and `locked` only; there
   is no `superseded-by:` status and no sanctioned mutation of any committed
   ledger line. VAL-02's chain is now reachable by appends alone, which is what
   made it a legal fixture again.
2. **ERR_STALE_REF governs `links` and `scope` only** (M0-REVIEW 3.2). Never
   `supersedes`. INV-04 fires it because D-003's `links` names D-001 while
   D-002 supersedes D-001.
3. **ERR_LINK and ERR_SCOPE are split by field** (M0-REVIEW 4.3, closing
   F-007): ERR_LINK for `links`, ERR_SCOPE for `scope`. INV-05 is the ERR_LINK
   fixture, INV-16 the ERR_SCOPE one.
4. **ERR_OWNER and ERR_MODEL_ID each serve two fixtures** (M0-REVIEW 4.2,
   closing F-006): ERR_OWNER at INV-01 (decision) and INV-09 (flag),
   ERR_MODEL_ID at INV-07 (decision) and INV-17 (flag). The INV-to-code map is
   many-to-one; every code has at least one fixture and every fixture expects
   exactly one code.
5. **The two git rules are disjoint by file** (F-020, closed by M0-REVIEW 3.5):
   ERR_SIGNOFF_MUTATION for `state/signoffs.md`, ERR_INPLACE_EDIT for the other
   three ledgers. No line of a committed ledger may change, with no whitelist
   and no exception.
6. **Non-ID link members do not resolve** (SCHEMA.md section 3): only members
   matching the `D-`, `F-`, `S-`, `AC-` plus three digits grammar are checked,
   so `links: [PROJECT.md#3]` is valid everywhere.
7. **Ledger preamble is ignored** (F-010): everything before the first `### `
   heading, which is how an empty ledger such as VAL-01's `criteria.md` stays
   legal.
8. **ERR_PROVENANCE has a definition** (M0-REVIEW 4.5, closing F-019): `author`
   missing or invalid, or `date` absent, applied per entry type to the fields
   that type's grammar defines. INV-06 fires it by removing `author`.
   ERR_MODEL_ID cannot fire on the same entry, being conditioned on an author or
   raiser of `agent`.
9. **`model:` is conditional on flags as on decisions** (M0-REVIEW 4.4, closing
   F-013 and F-018): required and non-none when `raised-by` is `agent`. VAL-01,
   VAL-02, VAL-04 and VAL-05 carry human-raised flags with no `model` field and
   are green, which is what makes the condition testable; VAL-03 carries the
   agent-raised flag that has one; INV-17 is the same flag without it.

## Git-level fixtures

INV-08, INV-14 and VAL-05 hold `base/` and `head/` snapshots plus
`fixture.json` instead of a `state/` tree (D-016, F-009). The runner
materialises them into a throwaway repository under `evals/.work/`, commits
`base/` then `head/`, and runs the parent-commit diff there. `counts` describes
the `head/` tree. VAL-05 is the passing case: its head is a byte-for-byte
prefix-preserving append, so the git check must stay silent.
