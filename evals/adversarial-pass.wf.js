/**
 * The internal adversarial pass, with D-034's budget actually enforced (D-037).
 *
 * WHAT THIS FILE IS. A Workflow tool script. It is not run by evals/run.sh, not
 * run by CI, and it never gates anything: the eval runner must not invoke an LLM
 * (E8/AC4), and this script is nothing but LLM calls. It is the build process's
 * own audit tool, committed here so that the rule governing it has something to
 * be enforced *in*. Until now it existed only as a prompt a session wrote from
 * scratch, which is why the cap could be missed twice without anything noticing.
 *
 * WHY IT IS COMMITTED AT ALL. D-029 set a cap. D-034 said what the cap counts and
 * that a pass approaching it "stops and files the remainder as open flags instead
 * of finishing large". Two passes then overran it — roughly 1.96M against roughly
 * 1M at M3, and 1,730,637 at the second M3 fix session (F-070) — because the
 * script capped agents and nothing else, and a cap that lives only in a decision
 * entry is advice. M3-REVIEW-3.md section 4: "A rule without a deterministic
 * check is a wish, and this project of all projects does not get to keep wishes
 * in its process."
 *
 * THE HARD PART, STATED RATHER THAN GLOSSED. The workflow runtime exposes output
 * tokens spent this turn. The two overruns above were recorded from the Workflow
 * tool's own subagent accounting, which is a different and larger number. So the
 * cap below is D-034's figure taken literally, in the unit this script can
 * actually read, and the first enforced pass is what tells Hamza whether that
 * number binds where D-034 meant it to. The script prints its own measured spend
 * against the cap for exactly that purpose. F-074 carried the question and
 * D-038 rules it: the cap stays bound in the unit this script can measure, at
 * D-034's literal number, and every real pass reports the measured unit and the
 * Workflow tool's subagent accounting SIDE BY SIDE, so the first enforced pass
 * produces a calibration datum instead of one number and a shrug. The operator
 * fills `tokens_workflow_accounting` from the runtime's own report when filing
 * the pass; recalibration off that datum is a labelled v0.2 item.
 *
 * HOW TO RUN IT. Through the Workflow tool, with this file's path as scriptPath.
 * Optional args, all of which only ever TIGHTEN the caps:
 *   { tokenCap: 400000, agentCap: 10, seriesBase: "<sha>", claims: "<what the
 *     session says it did>", lenses: ["d035-rule", "honesty", ...] }
 *
 * The guard between the markers below is lifted out and unit-tested by
 * test/d037-pass-budget.test.mjs. It is self-contained on purpose: this runtime
 * has no filesystem and no module loading, so the only way to test the code that
 * ships is to test the code that ships.
 *
 * `node --check` rejects this file, and that is not a defect: the workflow
 * runtime wraps the body in an async function, so the top-level `return` at the
 * end is the documented way to hand back a result. The .js extension keeps it
 * out of the `evals/**\/*.mjs` sweep for that reason.
 */

export const meta = {
  name: 'dsk-adversarial-pass',
  description: 'The D-034 internal adversarial pass, with the token cap enforced (D-037): lenses, then adversarial verification, stopping at the cap and filing the remainder',
  phases: [
    { title: 'Lenses', detail: 'read-only lenses over the working tree and the commit series' },
    { title: 'Verify', detail: 'adversarially refute each finding; only survivors are reported' },
  ],
}

/* D-034's cap, in one place. `agents: 15` is the decision's own number and is
   exact. `tokens` is its "roughly one million", read in the unit this runtime
   reports; see the header and F-074 before trusting it to bind. */
const CAPS = { agents: 15, tokens: 1_000_000 }

/* --8<-- D-037 budget guard: begin. Self-contained by requirement — no module
   loading, no runtime globals — because test/d037-pass-budget.test.mjs lifts
   this region out of the file and runs it on its own. Everything it needs comes
   in through its arguments.

   The contract, which is D-034's own sentence turned into arithmetic:
     - a caller asks before every unit of work, and takes no for an answer;
     - "no" is permanent, because a pass that stopped stays stopped;
     - an unreadable meter is spent, not free;
     - what was refused is returned, so the caller can file it as open flags. */
function makePassBudget({ tokens, agents, spent }) {
  if (typeof tokens !== 'number' || !Number.isFinite(tokens) || tokens <= 0)
    throw new Error(`the token cap must be a positive finite number, got ${String(tokens)}`)
  if (typeof agents !== 'number' || !Number.isFinite(agents) || agents <= 0)
    throw new Error(`the agent cap must be a positive finite number, got ${String(agents)}`)
  if (typeof spent !== 'function') throw new Error('the token cap needs a spend reader')

  const read = () => {
    try {
      const v = spent()
      return typeof v === 'number' && Number.isFinite(v) ? v : null
    } catch {
      return null
    }
  }

  const base = read()

  const state = {
    caps: { tokens, agents },
    admitted: 0,
    refused: [],
    aborted: false,
    reason: '',

    /** Spend since this guard was constructed, or null when unreadable. */
    spentSoFar() {
      const now = read()
      return now === null || base === null ? null : now - base
    },

    /** Ask before every unit of work. False means stop, and it never flips back. */
    admit(label) {
      if (state.aborted) {
        state.refused.push(label)
        return false
      }
      const used = state.spentSoFar()
      if (used === null) {
        state.aborted = true
        state.reason =
          'the runtime could not report token spend, so the cap could not be enforced; ' +
          'failing closed rather than running an unbounded pass'
        state.refused.push(label)
        return false
      }
      if (used >= tokens) {
        state.aborted = true
        state.reason = `the token cap of ${tokens} was reached at ${used}; the remainder is filed as open flags (D-034, D-037)`
        state.refused.push(label)
        return false
      }
      if (state.admitted >= agents) {
        state.aborted = true
        state.reason = `the agent cap of ${agents} was reached; the remainder is filed as open flags (D-034, D-037)`
        state.refused.push(label)
        return false
      }
      state.admitted += 1
      return true
    },

    /** What was planned and never run, for the flag that has to record it. */
    remainder(planned, done) {
      const ran = new Set(done)
      return planned.filter((item) => !ran.has(item))
    },
  }
  return state
}
/* --8<-- D-037 budget guard: end. */

const REPO = (typeof args === 'object' && args && args.repo) || '/Users/hamzaelessawy/Firesky'
const TOKEN_CAP = Math.min(CAPS.tokens, (typeof args === 'object' && args && args.tokenCap) || CAPS.tokens)
const AGENT_CAP = Math.min(CAPS.agents, (typeof args === 'object' && args && args.agentCap) || CAPS.agents)
const SERIES_BASE = (typeof args === 'object' && args && args.seriesBase) || 'HEAD~1'
const CLAIMS = (typeof args === 'object' && args && args.claims) || '(the session under audit stated no claims; read the commit messages)'

const pass = makePassBudget({ tokens: TOKEN_CAP, agents: AGENT_CAP, spent: () => budget.spent() })

const CONTEXT = `
You are auditing the repository at ${REPO} (project "dsk", an agent-native decision state kit).
Read-only: you may run git, node, npm, cat, grep, and the project's own binaries, but you MUST NOT
edit, create, or delete any file in the repository, and MUST NOT commit or push. Use /tmp for scratch.

Read these first:
  CLAUDE.md    the non-negotiable laws and build rules
  EVALS.md     the evaluation spec (it outranks convenience)
  SCHEMA.md    the schema
  PLAN.md      milestone status
  state/       the project's own ledgers, in the kit's own schema

The series under audit is ${SERIES_BASE}..HEAD plus the uncommitted working tree:
  git -C ${REPO} log --oneline ${SERIES_BASE}..HEAD
  git -C ${REPO} diff ${SERIES_BASE}..HEAD
  git -C ${REPO} status --short ; git -C ${REPO} diff

What the session under audit claims to have done:
${CLAIMS}

You are ONE lens. Report only what you can reproduce with a command. For every finding give: a one-line
claim, the exact command(s) that reproduce it, the observed output, and the severity
(law | correctness | gate-soundness | honesty | cosmetic). "law" means it breaks one of CLAUDE.md's six
laws. "honesty" means a committed file, commit message or report states something that is not true.
Do not report style preferences. Do not report anything you did not actually run.
If you find nothing real, say so plainly — an empty finding list is a valid and useful result.
`

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          claim: { type: 'string' },
          severity: { type: 'string' },
          reproduction: { type: 'string' },
          observed: { type: 'string' },
          why_it_matters: { type: 'string' },
        },
        required: ['claim', 'severity', 'reproduction', 'observed'],
      },
    },
    nothing_found_note: { type: 'string' },
  },
  required: ['lens', 'findings'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    refuted: { type: 'boolean' },
    verdict: { type: 'string' },
    evidence: { type: 'string' },
    corrected_claim: { type: 'string' },
    severity: { type: 'string' },
  },
  required: ['refuted', 'verdict', 'evidence'],
}

/**
 * The ONLY path to a subagent in this script, and the reason the cap is a check
 * rather than a wish. Refused work returns null and is recorded, never retried.
 */
function budgetedAgent(label, prompt, opts) {
  if (!pass.admit(label)) return Promise.resolve(null)
  return agent(prompt, { label, ...opts })
}

const ALL_LENSES = [
  { key: 'laws', prompt: `LENS: CLAUDE.md's six laws against what this series wrote to state/. Run
\`git -C ${REPO} diff ${SERIES_BASE}..HEAD -- state/\` and check that every hunk is a pure append.
Check provenance on every appended entry, every sign-off scope against the authorization it cites, and
whether \`node ${REPO}/dist/cli.js status .\` derives what the sign-offs claim to close.` },
  { key: 'gate-soundness', prompt: `LENS: can any gate this series touched pass without the thing it
grades having happened? Work in a /tmp copy of the repo so the real one is never written to. Try the
null-agent attack, hand-written results files, renamed directories, and missing or malformed fields.
Report anything that produces a PASS that should not.` },
  { key: 'seals', prompt: `LENS: the E5 and E6 seals. Do the committed hashes cover every input the run
actually depended on? Can an input change without a seal changing? Compare the harness's inputHashes
against the runner's inputHashesNow field by field, and check every consumer of both.` },
  { key: 'validator-rules', prompt: `LENS: try to break the validator's rules with hand-built trees under
/tmp, graded by \`node ${REPO}/dist/cli.js validate --json <dir>\`. Focus on the rules this series
touched, on entry kinds a rule was not written for, and on list and whitespace parsing edge cases.` },
  { key: 'fixture-blast-radius', prompt: `LENS: what else did the fixture and template changes touch?
Check every consumer of every changed fixture: expected outputs, the whole-tree passes, staleness,
status, render, the unit tests, and the runner's inventory checks. Run all of them.` },
  { key: 'doc-surfaces', prompt: `LENS: the shipped surfaces. Are the two SKILL.md copies byte-identical,
and is the AGENTS.md block byte-identical to templates/AGENTS.dsk.md? Does any shipped example produce an
invalid tree if followed literally? Does any shipped file reference this repository's own ids, paths or
history in a way that is meaningless in a user's project?` },
  { key: 'honesty', prompt: `LENS: honesty. Read every commit message in ${SERIES_BASE}..HEAD and every
prose paragraph this series added to any committed file. Check each factual claim against the repository:
counts, hashes, "red first" claims, "verified end to end" claims, cost and token figures. Report every
statement that is stronger than the evidence supports, however small.` },
  { key: 'process', prompt: `LENS: CLAUDE.md's build rules and D-014 against this session's own conduct.
Was anything eval-first? Were fixtures, expected outputs or thresholds edited to make a run pass? Was a
new dependency added? Did the session grade its own milestone? Was any ambiguity resolved without a flag?` },
  { key: 'spec-drift', prompt: `LENS: EVALS.md, SCHEMA.md and PROJECT.md against the implementation. Find
every place the spec and the code disagree, and say which one moved. Pay particular attention to anything
this series amended in a spec file.` },
  { key: 'deferred-scope', prompt: `LENS: CLAUDE.md build rule 3 — the things that must not be built in
v0.1 (L3 MCP server, R21 drift check, R23 LLM review pass, sync bridges, hosted components, any UI beyond
the static render). Did anything in this series build one, or lay groundwork that only makes sense if one
is coming?` },
]

const requested = (typeof args === 'object' && args && args.lenses) || null
const LENSES = requested ? ALL_LENSES.filter((l) => requested.includes(l.key)) : ALL_LENSES

/* The verification stage needs headroom, or a pass spends its whole budget
   finding things and none of it checking them — which is how unverified findings
   become the default rather than the exception. Half the agent cap, floor 1. */
const VERIFY_SLOTS = Math.max(1, Math.floor(AGENT_CAP / 3))
const LENS_SLOTS = Math.max(1, AGENT_CAP - VERIFY_SLOTS)

phase('Lenses')
log(`caps: ${AGENT_CAP} agents, ${TOKEN_CAP} tokens (D-034 as enforced by D-037)`)

const planned = LENSES.slice(0, LENS_SLOTS).map((l) => l.key)
if (planned.length < LENSES.length)
  log(`${LENSES.length - planned.length} lens(es) do not fit the agent cap and are filed unrun, not silently dropped`)

const lensResults = await pipeline(
  LENSES.slice(0, LENS_SLOTS),
  (l) => budgetedAgent(`lens:${l.key}`, `${CONTEXT}\n\n${l.prompt}`, { phase: 'Lenses', schema: FINDINGS_SCHEMA }),
  (r, l) => (r === null ? { lens: l.key, ran: false, findings: [] } : { lens: l.key, ran: true, findings: (r.findings || []).filter((f) => (f.severity || '').toLowerCase() !== 'cosmetic'), note: r.nothing_found_note || '' }),
)

const lensesRan = lensResults.filter(Boolean).filter((r) => r.ran).map((r) => r.lens)
const lensesUnrun = pass.remainder(planned, lensesRan).concat(LENSES.slice(LENS_SLOTS).map((l) => l.key))
const flat = lensResults.filter(Boolean).flatMap((r) => r.findings.map((f) => ({ ...f, lens: r.lens })))
log(`${flat.length} non-cosmetic finding(s) from ${lensesRan.length}/${LENSES.length} lenses; spend so far ${pass.spentSoFar()}`)
if (lensesUnrun.length) log(`unrun lenses, to be filed as open flags: ${lensesUnrun.join(', ')}`)
/* D-038 again, in the log this time, because the return value is read once and
   the log is what an operator watches a pass through. */
log(
  `spend, both accountings (D-038): measured ${pass.spentSoFar()} of ${TOKEN_CAP} output tokens this runtime reports; ` +
    `the Workflow tool's subagent total is not readable from inside the run — record it beside this number when filing the pass`,
)

const RANK = { law: 0, 'gate-soundness': 1, correctness: 2, honesty: 3, 'spec-drift': 4 }
const ordered = flat.slice().sort((a, b) => (RANK[(a.severity || '').toLowerCase()] ?? 9) - (RANK[(b.severity || '').toLowerCase()] ?? 9))

phase('Verify')

const verdicts = await parallel(
  ordered.map((f, i) => () =>
    budgetedAgent(
      `verify:${f.lens}-${i + 1}`,
      `${CONTEXT}\n\nYou are an adversarial verifier. Another agent claims the following about this repository.\n` +
        `Your job is to REFUTE it. Run the reproduction yourself. Default to refuted=true unless the\n` +
        `reproduction actually produces the claimed observation AND the consequence is real for this project.\n` +
        `A claim that reproduces but describes intended, documented behaviour is REFUTED — check the rulings in\n` +
        `the M*-REVIEW*.md files, the laws in CLAUDE.md, and the relevant flag in state/flags.md first.\n\n` +
        `CLAIM (lens ${f.lens}, severity ${f.severity}): ${f.claim}\n` +
        `REPRODUCTION: ${f.reproduction}\n` +
        `OBSERVED: ${f.observed}\n` +
        `WHY IT MATTERS: ${f.why_it_matters || '(not stated)'}\n\n` +
        `Return refuted=true/false, a one-paragraph verdict, the evidence you actually ran, and if the claim\n` +
        `survives in a narrower form, the corrected claim and its true severity.`,
      { phase: 'Verify', schema: VERDICT_SCHEMA },
    ).then((v) => ({ finding: f, verdict: v })),
  ),
)

const judged = verdicts.filter(Boolean).filter((v) => v.verdict)
const judgedClaims = new Set(judged.map((v) => v.finding.claim))
const unverified = ordered.filter((f) => !judgedClaims.has(f.claim))

/* D-034's own instruction: what the cap did not reach is written down as an open
   flag, not re-derived by fan-out and not quietly dropped. */
return {
  caps: { agents: AGENT_CAP, tokens: TOKEN_CAP },
  /* D-038: both accountings, side by side, on every real pass. `tokens_measured`
     is what this script can read and enforce against; `tokens_workflow_accounting`
     is the Workflow tool's subagent total, which no code inside the run can
     reach, so it is left null for the operator to fill from the runtime's own
     report when the pass is filed. A pass filed with it still null is a pass
     that produced no calibration datum, which is the one thing D-038 asks for. */
  spend: {
    agents_admitted: pass.admitted,
    tokens_measured: pass.spentSoFar(),
    tokens_measured_unit: 'output tokens for the turn, as this runtime reports them',
    tokens_workflow_accounting: null,
    tokens_workflow_accounting_note:
      'D-038: fill from the Workflow tool\'s reported subagent spend when filing this pass. ' +
      'The pair is the calibration datum; recalibrating the cap off it is a v0.2 item.',
  },
  aborted: pass.aborted,
  abort_reason: pass.reason,
  refused_labels: pass.refused,
  lenses_run: lensesRan,
  lenses_unrun: lensesUnrun,
  lenses_reporting_nothing: lensResults.filter(Boolean).filter((r) => r.ran && r.findings.length === 0).map((r) => r.lens),
  total_findings: flat.length,
  confirmed: judged.filter((v) => v.verdict.refuted === false).map((v) => ({
    lens: v.finding.lens,
    severity: v.verdict.severity || v.finding.severity,
    claim: v.verdict.corrected_claim || v.finding.claim,
    reproduction: v.finding.reproduction,
    observed: v.finding.observed,
    verdict: v.verdict.verdict,
    evidence: v.verdict.evidence,
  })),
  refuted: judged.filter((v) => v.verdict.refuted === true).map((v) => ({ lens: v.finding.lens, claim: v.finding.claim, why: v.verdict.verdict })),
  open_flag_candidates: {
    note: 'D-034: whatever the cap did not reach is filed as an open flag, in the pass\'s own words.',
    unverified_findings: unverified.map((f) => ({ lens: f.lens, severity: f.severity, claim: f.claim, reproduction: f.reproduction, observed: f.observed })),
    unrun_lenses: lensesUnrun,
  },
}
