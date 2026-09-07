# Requirements v0.1: Agent-Native Decision State Kit
Working name open, see D6. Date: 7 September 2026. Status: draft for Hamza's sign-off, then becomes PROJECT.md when the build starts.
Provenance: built on the 26 Jul cross-AI research brief, the reconciliation of 26 Jul, and live checks run 7 Sep. This document is written in the schema it specifies: decisions carry D numbers, open items carry F flags with owners, requirements carry R numbers, acceptance criteria carry AC numbers.

## 0. Scope lock

1. One layered product, four layers (L1 schema, L2 skill, L3 thin MCP server, L4 validator and drift checker). These are the four survivable delivery rungs from the reconciliation, collapsed into one install.
2. Users: Hamza first, then solo builders and PMs who share the two-truth struggle the research documented. Agents are first-class users (section 2).
3. Out of scope, permanently for v1: the sync and sign-off bridge (rung 5) and the standalone state platform (rung 6). Rejection grounds: rung 5 is a systems-integration build (auth, permissions, bidirectional sync) rated brutal for a solo operator, rung 6 was the unanimous trap across all three research runs, contested by funded incumbents. The non-technical stakeholder seam therefore stays unsolved here by design. This kit serves builders and their agents.

## 1. What changed since 26 July (live check, 7 Sep)

1.1. **Un-park trigger 1, decision-graph category: FIRED, in an unexpected direction.** Align (align.tech) now ships open source under MIT: one binary, no account, builds a decision graph from a repo and serves it to any MCP agent, captures decisions from Slack, Jira, GitHub and Teams, checks pull requests against the graph, self-hostable against your own Postgres, hosted version in a design-partner phase. No public funding round found.
1.2. Consequence: a from-scratch decision-graph MCP server is now adopt-pressure territory. This doc narrows L3 to a thin server over this kit's own file schema and sets an explicit interop stance (D3) plus a kill line (K3).
1.3. What Align is not, and where this kit lives: Align auto-captures engineering decisions from tool chatter into a database graph. This kit is an authored, file-native, product-decision discipline: D-numbered decisions, flags with owners, staged acceptance criteria, sign-off as a state transition, written by humans and agents on purpose, living in the repo as plain markdown. Database graph versus authored files, engineering exhaust versus product intent. Adjacent, not identical.
1.4. **Un-park trigger 2, standard convergence: NOT fired.** No cross-tool traceability or spec schema convergence found. The current Radar cycle notes term-level confusion (semantic diffusion) in this exact space. Fragmentation persists, which cuts both ways: room for a convention, and risk of adding to the noise (P7, RK4).
1.5. **F1 (owner: Hamza):** status of the July plan's post and its resonance metric. That was the agreed gate evidence for productizing the framework. Report status before the build starts.

## 2. Users and jobs

2.1. U1: Hamza. Solo PM-builder, several concurrent projects, agents doing real work in each.
2.2. U2: solo builders and PMs with the same struggle. The sharing audience, matching the small-tools direction.
2.3. U3: agents, in three roles. Reader (query state before acting), Writer (record decisions and flags through the schema), Verifier (check work against locked decisions, detect drift).
2.4. Jobs: J1 know which decisions are current and which are locked. J2 know who approved what and when. J3 know what drifted between the repo truth and the tracker truth. J4 give any agent trustworthy state without re-explaining the project. J5 carry one discipline identically across every project. J6 make the discipline shareable as an installable thing.

## 3. Design laws (non-negotiable, each traceable to a research finding)

P1. Files are the substrate, tools are views. The kit never becomes a coordination hub (bifurcation finding).
P2. Deterministic before generative. Every validation must run with zero LLM calls. LLM judgment is an optional layer on top, never the foundation (trust findings: verification is the bottleneck).
P3. Provenance on every entry: author type (human or agent), model identifier when agent, timestamp. Curation finding: agent-written context degrades ungated, so authorship must be visible.
P4. Sign-off is a state transition with an actor and a date, not a comment.
P5. Model-agnostic, cross-family verification. When LLM verification is used, the verifier defaults to a different model family than the proposer. This encodes the cross-AI protocol that produced this product's own evidence base.
P6. Local-first, bring-your-own keys, nothing to host for core value.
P7. Smallest possible schema surface, AGENTS.md-compatible, so the kit rides existing conventions instead of competing with them.

## 4. Layer requirements

Priority key: M must, S should, C could.

### L1. Schema and templates (the product's core)

R1 (M). File layout: a `state/` directory in any project repo containing `decisions.md`, `flags.md`, and `criteria.md` as append-oriented ledgers, plus `state.yaml` carrying schema version and project metadata. Rationale in D1.
R2 (M). ID grammar: `D-###` decisions, `F-###` flags, `AC-###` acceptance criteria. IDs are permanent, never reused.
R3 (M). Decision entry fields: id, title, status (proposed, locked, superseded-by-D-###), date, owner, provenance block (P3), rationale (max 5 lines), links.
R4 (M). Flag entry fields: id, title, owner, raised-by, date, status (open, resolved-by), resolution note.
R5 (M). Sign-off block grammar: actor, role, date, scope (which D or AC ids). A sign-off is appended, never edited.
R6 (M). Link syntax between entries and to spec sections, stories, tickets: plain relative references, greppable, no tooling required to follow.
R7 (S). Starter templates for three project types: software build, product spec, research workstream.

### L2. Skill and plugin (the method, agent-side)

R8 (M). A Claude Code skill exposing the method: commands `/decide`, `/flag`, `/signoff`, `/status`, `/drift`.
R9 (M). Agents write only through the schema. Malformed entries are refused with the validation error, not silently fixed.
R10 (M). Append and supersede only. No agent ever edits an existing entry in place.
R11 (M). An AGENTS.md snippet ships with the kit so Cursor, Copilot, Gemini CLI and other runtimes learn the same rules without the skill.
R12 (S). The skill reads `state/` on session start and briefs the agent on locked decisions and open flags before any work.

### L3. Thin MCP server

R13 (M). Read tools: `get_decision(id)`, `list_open_flags()`, `state_summary()`, `locked_decisions()`.
R14 (M). `validate()` tool wrapping the L4 validator.
R15 (M). One guarded write tool: `record_signoff`, which requires an explicit human confirmation step in the client. No other writes over MCP in v1.
R16 (M). stdio transport only in v1. Remote HTTP transport deferred (D4).
R17 (S). Documented export mapping from this schema to an Align-style graph, so a team already on Align can feed it (D3). No runtime dependency on Align.

### L4. CLI validator and drift checker

R18 (M). Deterministic schema validation: field completeness, ID grammar, status vocabulary, provenance presence. Zero network, zero LLM.
R19 (M). Referential integrity: no dangling links, no superseded decision still referenced as current, no orphan flags.
R20 (M). Staleness report: entries untouched past a configurable window, open flags past their owner-set date.
R21 (M). Two-truth drift check: takes a tracker export (Linear or Jira CSV or JSON) plus the `state/` ledgers, reports items that exist on one side only and status conflicts on shared items. Read-only, file-in file-out, explicitly not a sync.
R22 (M). CI mode: exit codes and a GitHub Action wrapper so validation gates merges.
R23 (C). Optional LLM-judged review pass (cross-family per P5) that comments on rationale quality. Never blocks, per P2.

## 5. Multi-agent and multi-LLM requirements

R24 (M). Proposer and verifier separation: any workflow where an agent proposes a decision and an agent verifies it must use different model families for the two roles when both are LLMs. Configurable providers, no lock-in.
R25 (M). Provenance records the exact model identifier for every agent-authored entry.
R26 (M). Degraded mode: every M-priority function above works with zero LLMs available. The kit remains fully usable as a human discipline.
R27 (M). Runtime coverage matrix: Claude Code via skill, other agent CLIs via AGENTS.md snippet, everything MCP-capable via L3. One schema, three doors.
R28 (M). Disagreement protocol: when a verifier (agent or human) disagrees with a proposed decision, the kit's only move is to open an F flag with a human owner. No auto-resolution, ever.

## 6. Technical architecture and hosting

6.1. Stack (D2, proposed): one TypeScript package. Rationale: `npx` gives a one-line install for U2, and the MCP SDK path is mature there. Python is the acceptable alternative if alignment with the MARSAD stack matters more to you. Either way Claude Code writes most of it, the choice is about distribution and your own comfort maintaining it.
6.2. Hosting for v1: nothing. GitHub repo, npm package, GitHub Action. Optional `render` command generating a static read-only HTML view of the state (publishable on GitHub Pages), which is the cheap concession to human readers and explicitly not the rung 5 bridge.
6.3. Costs: infrastructure $0. LLM usage on the user's own keys. Domain optional and cosmetic.
6.4. Deferred, each with an un-defer criterion: remote MCP transport (first real second-team request), any rendered sign-off UI (only if rung 5 evidence ever changes), Align runtime integration beyond the export mapping (only if D3 stance changes).

## 7. Open source and money

7.1. D5 (proposed): MIT license, open from the first commit. Grounds: distribution is your actual moat, conventions win by adoption not by sales, it matches the small-tools direction, and giving the tool away exits the tool-trap economics entirely, which is how this build stays consistent with the research verdict.
7.2. Money, if ever, comes from the green wedges around the free kit: templates, teaching, the method itself, and what the authorship does for your positioning. The kit is the demo of the framework, not the revenue line.
7.3. Accepted risk: Align or an incumbent absorbs the pattern. Acceptable because the durable asset is the method plus your authorship of it, not the binary.

## 8. The v0.1 experiment (one falsifiable step, your YC standard)

8.1. Build scope for v0.1: L1 complete, L4 validator complete (R18 to R20 plus R22), L2 minimal (`/decide`, `/flag`, `/status`). L3 and the drift check (R21) wait for the experiment's outcome.
8.2. Dogfood: run it on two live projects for two weeks. Candidates: MARSAD's own decision log, and the build system repo itself.
8.3. Metrics, placeholders for your numbers (F3): decisions and flags logged per project, validator catches, and the honest one: whether you reach for it unprompted on the second project by day 14.
8.4. Share once: publish the repo with one post. Signal metric relative to your own median engagement plus inbound conversations (F3).
8.5. Acceptance criteria: AC1 validator catches all of a seeded set of schema errors deterministically. AC2 the skill produces schema-valid entries in both live projects. AC3 a fresh user goes from install to first validated decision entry in under 10 minutes. AC4 zero-LLM mode passes the full validator run. AC5 the AGENTS.md snippet produces valid entries from at least one non-Claude runtime.
8.6. Kill lines: K1 if you have not reached for it unprompted on project two by day 14, it stays a template pack and the build stops. K2 if the public share lands below your median with zero inbound, L3 is never built. K3 if Align ships file-native markdown ingestion of authored decision ledgers, L3 dies immediately and the kit interops instead.
8.7. Timing: build starts after the MARSAD gate on 18 September unless you decide otherwise (F2). Proposed box: Tier M, six sessions across three weeks, money cap $0 beyond existing subscriptions (F4).

## 9. Risks

RK1. Premature abstraction. Held off by the second-use rule: nothing generalizes until project two actually uses it.
RK2. Calendar collision with the MARSAD ship gate. Held off by F2 sequencing.
RK3. Align adjacency. Held off by D3, the file-native product-decision niche, and K3.
RK4. Schema fragmentation, the kit becomes one more format in a noisy space. Held off by P7: smallest surface, rides AGENTS.md, three files and one grammar.
RK5. Single-owner follow-through. Held off structurally: smallest possible v0.1, dated gates, kill lines that make stopping a defined outcome instead of a quiet fade.
RK6. The seam stays unsolved. Declared, not hidden: this kit serves builders and agents, not business stakeholders.

## 10. Decision and flag ledger (this document, in its own schema)

D1 (locked). Ledger files over per-item files: three markdown ledgers plus one yaml, append-oriented, diff-friendly, greppable.
D2 (proposed, owner: Hamza). TypeScript single package, Python as the stated alternative.
D3 (locked). Align stance: interop, not compete. Export mapping documented post-v0.1, no dependency, K3 governs.
D4 (locked). Remote MCP transport deferred until a real second-team request exists.
D5 (proposed, owner: Hamza). MIT, open from first commit.
D6 (open, owner: Hamza). Name. The doc uses "the kit" until you name it.
F1 (open, owner: Hamza). July post status and its resonance numbers, the agreed gate evidence.
F2 (open, owner: Hamza). Confirm build start after 18 Sep, or consciously trade against MARSAD.
F3 (open, owner: Hamza). Your numbers for the 8.3 and 8.4 metrics.
F4 (open, owner: Hamza). Confirm or resize the Tier M box (six sessions, three weeks).

## 11. Route into the Personal Build System

Tier M. Field: greenfield tool with a brownfield hook into the build system repo. This document distills into the G0 brief once D2, D5, F2, F3 and F4 close. On build start, this file moves into the repo and becomes the living PROJECT.md. Chats stay disposable, this file is the memory.

## 12. Ledger updates, 7 Sep (build handoff), append-and-supersede

D2 (locked by default, 7 Sep, supersedes proposed): TypeScript single package. Override costs nothing if said before M0 ends.
D5 (locked by default, 7 Sep): MIT from first commit. License is trivially changeable any time before publish.
D6 (still open, owner: Hamza): working slug `dsk`, package placeholder `decision-state-kit`. Rename is one command before publish.
D7 (locked, 7 Sep): evaluation-first build order. No feature code before its fixtures exist and fail. Named by Hamza as the most important part of this build.
F2 (closed, 7 Sep): build starts now, before the 18 Sep MARSAD gate, by Hamza's explicit call. The trade is named: kit sessions compete directly with MARSAD prep for the next eleven days.
F4 (closed by default, 7 Sep): Tier M, six sessions across three weeks, money cap $0 beyond existing subscriptions.
F1 (open, owner: Hamza): July post status and resonance numbers. K1 and K2 still govern regardless.
F3 (open, owner: Hamza): metric numbers. Proposed defaults live in EVALS.md section 10 and apply until replaced.

## 13. Ledger updates, 7 Sep (mistake-avoidance pass), append-and-supersede

D8 (locked). Concrete ledger grammar frozen in SCHEMA-DRAFT.md. M0 promotes it verbatim to SCHEMA.md. The builder transcribes, never invents. Gaps become F flags.
D9 (locked, supersedes part of R1). Four ledgers, not three: signoffs.md joins decisions.md, flags.md, criteria.md. Sign-offs are first-class append-only entries.
D10 (locked). Hand-rolled line-oriented parser on the strict grammar. No markdown AST dependency.
D11 (locked). Validator is a rule registry: one module per error code, every rule ships with its fixture pair.
D12 (locked). Git-level checks shell out to git (parent-commit diff). No git library.
D13 (locked). Tests run on the Node built-in test runner. No test framework dependency.
D14 (locked). Build-process protocol: fresh session per milestone, plan-first inside each session, deterministic eval gates, external cross-model review after M0 and M3, fixture and threshold edits forbidden without a flag. Details in CLAUDE.md.
