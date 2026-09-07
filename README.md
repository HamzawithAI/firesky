# decision-state-kit (`dsk`)

An agent-native decision state kit: four append-only markdown ledgers, a
deterministic validator that runs with zero LLM calls and zero network, and a
minimal Claude Code skill. Files are the substrate; tools are views.

> **Status: M0 scaffold.** The fixture suite exists and is red by design. No
> validator code has been written yet (D7, evaluation-first). The ten-minute
> install path is written at M4 — see [PLAN.md](PLAN.md).

## What is here today

| Path | Contents |
|---|---|
| [SCHEMA.md](SCHEMA.md) | The frozen ledger grammar and error-code inventory (D8) |
| [`state/`](state/) | This repo's own ledgers — the kit is dogfooded from commit one |
| [`evals/`](evals/) | 20 schema fixtures, expected outputs, 7 agent scenarios, the runner |
| [PROJECT.md](PROJECT.md) · [PLAN.md](PLAN.md) · [EVALS.md](EVALS.md) | Requirements, milestones, evaluation spec |

## Running the evals

```bash
bash evals/run.sh
```

Exits non-zero at M0. That is the M0 gate: the inventory check passes, every
fixture reports `NOT_IMPLEMENTED`, and the run report lands in
[`evals/reports/`](evals/reports/).

## License

MIT (D-005), open from the first commit.
