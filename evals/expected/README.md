# Expected outputs

One JSON file per fixture, matching the validator contract in SCHEMA.md
section 5. Written at M0, before any validator code exists (D-007). These files
are the specification the M1 validator is built against, not a recording of
what it happens to produce.

**Do not edit a file here to make a run pass.** A failing eval is a report
(CLAUDE.md, D-014 clause 4). A legitimate change needs an F flag with rationale
in the same commit.

## Comparison predicate (F-008)

EVALS.md requires expected output per fixture but never defines what is
asserted. Until F-008 closes, the runner compares:

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

1. **ERR_STALE_REF exempts the supersede chain** (F-015). It governs `links`
   and `scope` members only, never `supersedes` or `superseded-by:` targets.
   Without this, VAL-02 could not exist.
2. **ERR_OWNER serves two fixtures** (F-006): INV-01 for decisions, INV-09 for
   flags. The INV-to-code map is many-to-one, not one-to-one.
3. **The two git rules are disjoint by file** (F-020): ERR_SIGNOFF_MUTATION for
   `state/signoffs.md`, ERR_INPLACE_EDIT for the other three ledgers. A modified
   sign-off yields exactly one code, not both. SCHEMA.md does not say this; the
   rule is an interpretation carried by F-020, not by D-016, which covers only
   how the two-commit fixtures are stored.
4. **Non-ID link members do not resolve** (SCHEMA.md section 3): only members
   matching the `D-`, `F-`, `S-`, `AC-` plus three digits grammar are checked,
   so `links: [PROJECT.md#3]` is valid everywhere.
5. **Ledger preamble is ignored** (F-010): everything before the first `### `
   heading, which is how an empty ledger such as VAL-01's `criteria.md` stays
   legal.
6. **ERR_PROVENANCE is defined only by INV-06** (F-019): SCHEMA.md lists the code
   but states no rule for it anywhere. A decision missing `author`, or missing
   `model` entirely, has no provenance block. ERR_MODEL_ID cannot fire on the
   same entry, being conditioned on `author: agent`.
7. **A supersede transition is the one permitted in-place change** (F-016), and
   only on a decision's `status` line. Everything else in a committed entry is
   frozen. VAL-02's end state depends on this reading.

## Git-level fixtures

INV-08 and INV-14 hold `base/` and `head/` snapshots plus `fixture.json`
instead of a `state/` tree (D-016, F-009). The runner materialises them into a
throwaway repository under `evals/.work/`, commits `base/` then `head/`, and
runs the parent-commit diff there. `counts` describes the `head/` tree.
