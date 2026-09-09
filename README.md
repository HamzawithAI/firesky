# decision-state-kit (`dsk`)

Four append-only markdown ledgers, a deterministic validator that runs with zero
LLM calls and zero network, and a minimal Claude Code skill. Files are the
substrate; tools are views.

The problem it addresses: agents are excellent at doing the work and terrible at
remembering what was decided. Chat scrollback is not a record, and a tracker is
not a rationale. `dsk` puts the decisions, the open questions, the acceptance
criteria and the sign-offs in four files next to the code, in a grammar strict
enough that a machine can check it and plain enough that a person can read the
diff.

Six rules, and they are the whole product:

1. Files are the substrate. No database, no server, no hosted anything.
2. Deterministic before generative. The validator makes no model call.
3. Provenance on every entry: who wrote it, which model if an agent did, when.
4. A sign-off is an appended state transition, never an edit.
5. Append and supersede only. Nothing edits an entry in place, including the agent.
6. The smallest schema that works. When in doubt, the field is left out.

## The ten-minute path

From nothing to a validated first decision. Every command below is executed on
every CI run by `evals/install/e7.mjs`, which reads this section and runs it in a
fresh directory — if it stops working, the build goes red.

```bash
npm install decision-state-kit
cp -R node_modules/decision-state-kit/templates/state ./state
```

Name the project and set today's date:

```bash
cat > state/state.yaml <<'YAML'
schema: "0.1"
project: my-project
created: 2026-01-01
staleness_days: 30
YAML
```

Record the first decision. This is the shape of every decision entry: an id, a
one-line title, the status, the date, an owner, a provenance block, links, and a
rationale of at most five lines.

```bash
cat >> state/decisions.md <<EOF

### D-001: Adopt dsk for this project's decision state
status: locked
date: $(date +%F)
owner: $(git config user.name 2>/dev/null || echo me)
author: human
model: none
links: [README.md]
supersedes: none

Chat scrollback is not a record and the tracker holds no rationale. Decisions,
open questions and sign-offs live in state/ from here, append-only.
EOF
```

Check it:

```bash
npx dsk validate .
```

That prints `is valid`, exits 0, and you are done. Everything else is optional.

## The four commands

```
dsk validate  [path] [--json]              schema and referential integrity, exit 1 on error
dsk status    [path] [--json]              what is locked, what is open, derived not read
dsk staleness [path] [--json] [--window N] entries untouched past a window
dsk render    [path] [--out FILE]          one self-contained HTML page, no script, no network
```

`--json` on any of them gives machine-readable output with stable error codes.
`DSK_NOW` pins the clock so reports are deterministic.

## In CI

The Action validates a repository's ledgers on every push and fails the build on
a schema error or an in-place edit of a committed entry:

```yaml
- uses: HamzawithAI/firesky@main
  with:
    path: "."
```

Pin it to a release tag rather than `main` once v0.1.0 is tagged. Set
`fetch-depth: 2` on `actions/checkout`, or the append-only check has no parent
commit to compare against and will decline to run — silently, as far as the exit
code is concerned (F-077).

## For agents

- **Claude Code**: copy `templates/claude/` into your project's `.claude/` for
  the `dsk` skill and the `/decide`, `/flag` and `/status` commands.
- **Everything else** — Cursor, Copilot, Gemini CLI, Codex: paste
  `templates/AGENTS.dsk.md` into your `AGENTS.md` (or `GEMINI.md`, or
  `.cursorrules`). It carries the same rules with no skill and no MCP server.

## What is in this repository

| Path | Contents |
|---|---|
| [SCHEMA.md](SCHEMA.md) | The ledger grammar and the sixteen error codes |
| [`templates/`](templates/) | Starter ledgers, the Claude Code skill, the AGENTS.md snippet |
| [`state/`](state/) | This repository's own ledgers — the kit is dogfooded from commit one |
| [`evals/`](evals/) | 24 fixtures, 7 agent scenarios, the cross-runtime kit, the runner |
| [PROJECT.md](PROJECT.md) · [PLAN.md](PLAN.md) · [EVALS.md](EVALS.md) | Requirements, milestones, evaluation spec |

```bash
bash evals/run.sh
```

runs everything and writes a dated report to [`evals/reports/`](evals/reports/).

## Status, and what v0.1 does not do

v0.1 is the validator, the schema, the skill and the snippet. Honestly stated:

- **No `dsk init`.** The ten-minute path above is a copy and a paste on purpose;
  the subcommand is a v0.2 item (D-039).
- **Two rules need git.** The append-only checks shell out to git. Where git is
  absent they report nothing and `validate` still exits 0 (F-077).
- **The MCP server, the tracker drift check and the LLM review pass are not
  built.** They are deferred by decision, not missing by accident.
- **Cross-runtime evidence is one manual run** on one non-Claude runtime, and
  what it does and does not establish is written down in F-075.

Open questions live in [`state/flags.md`](state/flags.md), every one with an
owner, and the ship triage in [TRIAGE.md](TRIAGE.md) gives each of them a line.

## License

MIT (D-005), open from the first commit.
