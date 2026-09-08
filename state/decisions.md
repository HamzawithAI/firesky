# Decisions

### D-001: Ledger files over per-item files
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#10, R1]
supersedes: none

Append-oriented markdown ledgers plus one yaml file, rather than one file per item.
Diff-friendly, greppable, and readable with no tooling in the loop.
Amended by D-009: four ledgers, not three.

### D-002: TypeScript single package
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#6.1, PROJECT.md#12]
supersedes: none

npx gives U2 a one-line install and the MCP SDK path is mature in TypeScript.
Python was the stated alternative if MARSAD-stack alignment mattered more.
Proposed in PROJECT.md section 10, locked by default on 7 Sep per section 12.

### D-003: Align stance is interop, not compete
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#1.1, PROJECT.md#10, R17]
supersedes: none

Align auto-captures engineering exhaust into a database graph; this kit is an
authored, file-native product-decision discipline. Adjacent, not identical.
Export mapping is documented post-v0.1. No runtime dependency. K3 governs.

### D-004: Remote MCP transport deferred
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#6.4, R16]
supersedes: none

stdio transport only in v1. Un-defer criterion: a real second-team request.

### D-005: MIT, open from the first commit
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#7.1, PROJECT.md#12]
supersedes: none

Distribution is the moat; conventions win by adoption, not by sales.
Giving the kit away exits the tool-trap economics the research rejected.
Proposed in section 10, locked by default on 7 Sep per section 12.

### D-006: Name and package slug
status: proposed
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#12, F-012]
supersedes: none

Working slug dsk, package placeholder decision-state-kit. Rename is one command
before publish. Carried as proposed rather than the source document's "open",
which is not in the schema status vocabulary; see F-012.

### D-007: Evaluation-first build order
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#12, EVALS.md#1]
supersedes: none

No feature code before its fixtures exist and fail. Named by Hamza as the most
important part of this build. EVALS.md outranks convenience.

### D-008: Ledger grammar frozen in SCHEMA-DRAFT.md
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#13, SCHEMA.md]
supersedes: none

M0 promotes the draft verbatim to SCHEMA.md. The builder transcribes, never
invents. Gaps become F flags rather than improvisations.

### D-009: Four ledgers, not three
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#13, SCHEMA.md#1, D-001, R1]
supersedes: none

signoffs.md joins decisions.md, flags.md and criteria.md. Sign-offs are
first-class append-only entries, not comments (P4). Amends part of R1.

### D-010: Hand-rolled line-oriented parser
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#13, SCHEMA.md#2]
supersedes: none

The strict grammar is parsed line by line. No markdown AST dependency.

### D-011: Validator is a rule registry
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#13, SCHEMA.md#6]
supersedes: none

One module per error code, and every rule ships with its fixture pair.

### D-012: Git-level checks shell out to git
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#13, EVALS.md#4]
supersedes: none

Parent-commit diff via the git binary. No git library dependency.

### D-013: Node built-in test runner
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#13]
supersedes: none

Tests run on node --test. No test framework dependency.

### D-014: Build-process protocol
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#13, CLAUDE.md, PLAN.md]
supersedes: none

Fresh session per milestone, plan-first inside each session, deterministic eval
gates, external cross-model review after M0 and M3, fixture and threshold edits
forbidden without a flag. Details in CLAUDE.md.

### D-015: Migration collapses each source ledger item to one entry
status: locked
date: 2026-09-07
owner: hamza
author: agent
model: claude-opus-5
links: [PROJECT.md#10, PROJECT.md#12, PROJECT.md#13, D-008]
supersedes: none

PROJECT.md states D-002, D-005, F-002 and F-004 twice, once proposed and once
resolved. IDs are permanent and never reused (ERR_DUP_ID), so each migrates as
a single entry at its final state, with the earlier position named in prose.
Append-and-supersede applies to entries made in this schema, not to the
transcription of a document that predates it.

### D-016: Git-level fixtures ship as snapshots, not nested repositories
status: locked
date: 2026-09-07
owner: hamza
author: agent
model: claude-opus-5
links: [EVALS.md#4, D-012, F-009]
supersedes: none

INV-08 and INV-14 ship as base/ and head/ directory snapshots plus a manifest.
The runner materialises them into a throwaway git repository under evals/.work/
and runs the parent-commit diff there. Committing a nested .git is not viable.

### D-017: Eval runner is a Node script wrapped by evals/run.sh
status: locked
date: 2026-09-07
owner: hamza
author: agent
model: claude-opus-5
links: [EVALS.md#2, D-013, AC-001]
supersedes: none

EVALS.md fixes evals/run.sh as the entry point; D-013 fixes the Node built-in
runner. run.sh is a thin wrapper over evals/runner.mjs, which uses Node
built-ins only so the red gate never depends on an install step.

### D-018: CLI exit-code convention
status: locked
date: 2026-09-07
owner: hamza
author: agent
model: claude-opus-5
links: [SCHEMA.md#5, R22]
supersedes: none

0 green, 1 validation errors found, 2 not implemented or internal failure.
SCHEMA.md fixes only that 0 means ok; 1 and 2 are separated so CI can tell a
real finding from a broken binary. No ERR_ code is minted for exit 2.

### D-019: Argument parsing uses the Node built-in
status: locked
date: 2026-09-07
owner: hamza
author: agent
model: claude-opus-5
links: [CLAUDE.md, PROJECT.md#3]
supersedes: none

node:util parseArgs covers the CLI surface, so yaml is the only runtime
dependency. The allowed baseline was argument parsing and yaml; taking less
than the ceiling needs no waiver and serves P7.

### D-020: The inventory check is a tamper check, not just an existence check
status: locked
date: 2026-09-07
owner: hamza
author: agent
model: claude-opus-5
links: [EVALS.md#2, D-017, F-024]
supersedes: none

Existence alone let a fixture emptied to zero bytes still report COMPLETE, which
is the weakening D-014 clause 4 exists to prevent. The runner now also asserts
every fixture file is non-empty and that each tree's entry count matches its own
expected file. Counting headings is fixture integrity; validating ledger content
against SCHEMA.md remains M1's work and is not done here.

### D-021: Supersession by derivation
status: locked
date: 2026-09-07
owner: hamza
author: agent
model: claude-opus-5
links: [M0-REVIEW.md#3, SCHEMA.md#2, D-008, F-015, F-016, F-017]
supersedes: none

Ruled by the D14.3 external review in M0-REVIEW.md section 3, transcribed here.
Status vocabulary shrinks to proposed and locked; superseded-by: is removed. An
entry is superseded if and only if a later entry names it in supersedes:, so
every chain is reachable by appends alone and the git check needs no whitelist.
Rejected: one sanctioned mutation, which reopens the tamper surface D-020 closed.

### D-022: R19's no-orphan-flags clause is cut for v0.1
status: locked
date: 2026-09-07
owner: hamza
author: agent
model: claude-opus-5
links: [M0-REVIEW.md#4.7, PROJECT.md#4, F-022]
supersedes: none

Ruled by the D14.3 external review in M0-REVIEW.md section 4.7. R19 names "no
orphan flags", but the flag grammar carries no field that could make a flag an
orphan, so the rule is unenforceable as written. No error code is minted and no
fixture is added; the inventory stays at fifteen codes. An optional links field
on flags is deferred, P7 governs.

### D-023: The eval gate counts only suites whose harness exists
status: proposed
date: 2026-09-07
owner: hamza
author: agent
model: claude-opus-5
links: [PLAN.md, EVALS.md#6, D-017, F-028]
supersedes: none

PLAN.md gates M1 on E1, E2, E3 and CI green, but E5's harness is not built until
M3, so counting seven unbuilt scenario suites as failures would make M1's own
gate unsatisfiable. They report PENDING, sit outside the exit code, and every
report prints their count, so nothing is hidden behind a green line. Proposed
rather than locked: no sign-off covers it yet (F-025).

### D-024: The flag model field applies from a dated cutoff
status: proposed
date: 2026-09-08
owner: hamza
author: agent
model: claude-opus-5
links: [M1-REVIEW.md#2.2, SCHEMA.md#2, D-021, F-030, F-025]
supersedes: none

Ruled by the M1 external review in M1-REVIEW.md section 2.2, transcribed here.
The model: requirement on flag entries applies only from MODEL_FIELD_SINCE,
2026-09-08. F-005 to F-024 were lawfully written before the field existed and
D-021 forbids editing them. Known limit accepted: a backdated flag dodges it,
and the git record shows that without the validator enforcing it.
