#!/usr/bin/env node
/**
 * E5 agent-behaviour harness (EVALS.md section 6, PLAN.md M3.3).
 *
 * Seven scenarios, five trials each, thirty-five headless runs of the real
 * Claude Code CLI against a disposable copy of VAL-01 with the kit's skill
 * installed. Grading is deterministic: the validator, a git diff against the
 * parent commit, and string assertions against a scripted census. No model
 * judges any result (EVALS.md section 1.2).
 *
 * WHY THIS IS NOT PART OF `evals/run.sh`.
 * The runner must never invoke an LLM. E8 (AC4) requires the full validator
 * suite to run with no network and no API keys present, and CI runs on every
 * push with neither. So this harness is run deliberately, writes its verdicts
 * to evals/scenarios/results.json, and the runner grades from that file. The
 * results file carries a sha-256 of every scenario spec and of the fixture it
 * ran against, so editing a spec or a fixture after the fact invalidates the
 * results rather than silently keeping them green — the same tamper reasoning
 * as D-020.
 *
 * The command line is fixed by EVALS.md section 6 and is not the harness's to
 * choose:
 *   claude -p "<prompt>" --permission-mode acceptEdits --allowedTools "Bash,Read,Write,Edit"
 * `--output-format json` is added so token counts can be recorded, which the
 * same section requires ("the harness prints a per-run count"). It changes what
 * is captured, not what the agent is asked or allowed to do.
 *
 * Usage:
 *   node evals/scenarios/harness.mjs                  all seven, five trials
 *   node evals/scenarios/harness.mjs --only S3,S4     a subset
 *   node evals/scenarios/harness.mjs --trials 1       fewer trials (a smoke run;
 *                                                     the results file records
 *                                                     that it was not a full run)
 *   node evals/scenarios/harness.mjs --concurrency 4  parallel trials
 */
import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { LEDGERS, gradeTrial, observe } from "./graders.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCENARIO_DIR = join(ROOT, "evals", "scenarios");
const RESULTS = join(SCENARIO_DIR, "results.json");
const CLI = join(ROOT, "dist", "cli.js");

const sha = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);
const read = (p) => readFileSync(p, "utf8");

/* ------------------------------------------------------------- spec parsing */

/** Scenario specs are the source of truth for prompt, threshold and trials. */
function loadSpecs() {
  const ids = readdirSync(SCENARIO_DIR)
    .filter((f) => /^S\d\.md$/.test(f))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
  return ids.map((id) => {
    const text = read(join(SCENARIO_DIR, `${id}.md`));
    const fieldOf = (key) => (new RegExp(`^${key}:\\s*(.+)$`, "m").exec(text) ?? [])[1]?.trim();
    // The prompt is the quoted string on the `claude -p "..."` line of the spec.
    const prompt = (/claude -p "((?:[^"\\]|\\.)*)"/.exec(text) ?? [])[1];
    if (prompt === undefined) throw new Error(`${id}.md has no 'claude -p "..."' command block`);
    const threshold = fieldOf("threshold");
    const need = Number((/^(\d+) of (\d+)$/.exec(threshold ?? "") ?? [])[1]);
    const trials = Number(fieldOf("trials"));
    if (!Number.isInteger(need) || !Number.isInteger(trials))
      throw new Error(`${id}.md: unreadable threshold '${threshold}' or trials '${fieldOf("trials")}'`);
    return {
      id,
      prompt: prompt.replace(/\\"/g, '"'),
      kind: fieldOf("kind"),
      threshold,
      need,
      trials,
      fixture: fieldOf("fixture"),
      /* D-031: S7 names its own gibberish token here, so the prompt and the
         assertion that the token reaches no ledger come from one line. */
      forbiddenToken: fieldOf("forbidden-token") ?? "",
      pairedAction: (fieldOf("paired-action") ?? "no") === "yes",
      specHash: sha(text),
    };
  });
}

/* -------------------------------------------------------------- trial setup */

function git(cwd, ...args) {
  return spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
}

/** A `dsk` shim on PATH, so the agent under test can run the real CLI. */
function makeShim() {
  const dir = mkdtempSync(join(tmpdir(), "dsk-bin-"));
  const shim = join(dir, "dsk");
  writeFileSync(shim, `#!/bin/sh\nexec ${process.execPath} ${JSON.stringify(CLI)} "$@"\n`, { mode: 0o755 });
  return dir;
}

/**
 * A disposable copy of the fixture, git-initialised and committed, with the
 * kit's skill installed exactly as a user would install it.
 *
 * Deliberately NOT installed: templates/AGENTS.dsk.md. That snippet is E6's
 * door, for runtimes with no skill system, and installing it here would mean
 * E5 could pass on the snippet while the skill did nothing. Verified by hand
 * before the harness was written: the skill alone reaches the agent under this
 * allowedTools set, with zero permission denials.
 */
function setupTrial(fixture) {
  const dir = mkdtempSync(join(tmpdir(), "dsk-e5-"));
  cpSync(join(ROOT, fixture, "state"), join(dir, "state"), { recursive: true });
  mkdirSync(join(dir, ".claude"), { recursive: true });
  cpSync(join(ROOT, "templates", "claude", "skills"), join(dir, ".claude", "skills"), { recursive: true });
  cpSync(join(ROOT, "templates", "claude", "commands"), join(dir, ".claude", "commands"), { recursive: true });
  git(dir, "init", "-q");
  git(dir, "config", "user.email", "evals@dsk.local");
  git(dir, "config", "user.name", "dsk evals");
  git(dir, "add", "-A");
  git(dir, "commit", "-q", "-m", "seed: fixture tree plus the dsk skill");
  return dir;
}

/* The graders, `observe`, and the ledger list live in ./graders.mjs so the
   runner can re-run exactly this logic over the tree it reconstructs from the
   committed per-trial diff (D-032 section 4.3). Two copies would drift, and the
   re-derivation would then be grading something else. */

/* -------------------------------------------------------------- trial runner */

function runClaude(dir, prompt, shimDir) {
  return new Promise((resolve) => {
    const child = spawn(
      "claude",
      ["-p", prompt, "--permission-mode", "acceptEdits", "--allowedTools", "Bash,Read,Write,Edit",
       "--output-format", "json"],
      { cwd: dir, encoding: "utf8", env: { ...process.env, PATH: `${shimDir}:${process.env.PATH}` } },
    );
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => resolve({ code, out, err }));
    child.on("error", (e) => resolve({ code: -1, out: "", err: String(e) }));
  });
}

async function runTrial(spec, n, shimDir) {
  const dir = setupTrial(spec.fixture);
  try {
    const before = Object.fromEntries(LEDGERS.map((l) => [l, existsSync(join(dir, l)) ? read(join(dir, l)) : ""]));
    const started = process.hrtime.bigint();
    const { code, out, err } = await runClaude(dir, spec.prompt, shimDir);
    const ms = Number((process.hrtime.bigint() - started) / 1_000_000n);
    let payload = null;
    try {
      payload = JSON.parse(out);
    } catch {
      /* payload stays null; the trial fails on cliError below */
    }
    const text = payload?.result ?? "";
    const cliError = payload === null || payload.is_error === true;
    const o = observe(dir, before, CLI);
    const graded = gradeTrial(spec, o, text, cliError, (err || out).trim().slice(0, 200) || `exit ${code}`);
    return {
      trial: n,
      pass: graded.pass,
      checks: graded.checks,
      ms,
      usage: payload?.usage
        ? {
            input: payload.usage.input_tokens ?? 0,
            output: payload.usage.output_tokens ?? 0,
            cache_read: payload.usage.cache_read_input_tokens ?? 0,
            cache_creation: payload.usage.cache_creation_input_tokens ?? 0,
          }
        : null,
      cost_usd: payload?.total_cost_usd ?? null,
      model: payload?.modelUsage ? Object.keys(payload.modelUsage)[0] : null,
      permission_denials: (payload?.permission_denials ?? []).length,
      output: text,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Bounded concurrency, so 35 live runs do not take 35 sequential round trips. */
async function pool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      for (;;) {
        const i = next++;
        if (i >= items.length) return;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

/* --------------------------------------------------------------------- main */

const argOf = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : process.argv[i + 1];
};

if (!existsSync(CLI)) {
  process.stderr.write("harness: dist/cli.js is absent. Run `npm run build` first.\n");
  process.exit(2);
}

const only = argOf("--only", null);
const trialsOverride = argOf("--trials", null);
const concurrency = Number(argOf("--concurrency", "4"));
const specs = loadSpecs().filter((s) => only === null || only.split(",").includes(s.id));
if (specs.length === 0) {
  process.stderr.write(`harness: no scenarios matched --only ${only}\n`);
  process.exit(2);
}

const shimDir = makeShim();
const started = Date.now();
const scenarios = [];

process.stdout.write(`E5 harness: ${specs.length} scenarios, concurrency ${concurrency}\n\n`);

for (const spec of specs) {
  const trials = trialsOverride === null ? spec.trials : Number(trialsOverride);
  const results = await pool(
    Array.from({ length: trials }, (_, i) => i + 1),
    concurrency,
    (n) => runTrial(spec, n, shimDir),
  );
  const passed = results.filter((r) => r.pass).length;
  const met = passed >= (trialsOverride === null ? spec.need : Math.min(spec.need, trials));
  const tokens = results.reduce((a, r) => a + (r.usage?.output ?? 0), 0);
  const cost = results.reduce((a, r) => a + (r.cost_usd ?? 0), 0);
  scenarios.push({
    id: spec.id,
    kind: spec.kind,
    threshold: spec.threshold,
    need: spec.need,
    trials,
    passed,
    met,
    spec_sha256: spec.specHash,
    fixture: spec.fixture,
    output_tokens: tokens,
    cost_usd: Number(cost.toFixed(4)),
    results,
  });
  process.stdout.write(
    `${met ? "PASS" : "FAIL"}  ${spec.id}  ${passed}/${trials} (needs ${spec.threshold}, ${spec.kind})` +
      `  ${tokens} output tokens, $${cost.toFixed(2)}\n`,
  );
  for (const r of results.filter((x) => !x.pass))
    for (const c of r.checks.filter((x) => !x.ok))
      process.stdout.write(`        trial ${r.trial}: ${c.name} — ${c.detail}\n`);
}

/* Fixture integrity: the results are only valid for the tree they ran against. */
const fixtureHash = (fixture) =>
  sha(LEDGERS.concat(["state/state.yaml"]).map((f) => read(join(ROOT, fixture, f))).join("\0"));
const skillHash = sha(read(join(ROOT, "templates", "claude", "skills", "dsk", "SKILL.md")));

const payload = {
  generated: new Date().toISOString().slice(0, 10),
  harness_sha256: sha(read(fileURLToPath(import.meta.url))),
  skill_sha256: skillHash,
  full_run: only === null && trialsOverride === null,
  duration_s: Math.round((Date.now() - started) / 1000),
  totals: {
    trials: scenarios.reduce((a, s) => a + s.trials, 0),
    passed: scenarios.reduce((a, s) => a + s.passed, 0),
    output_tokens: scenarios.reduce((a, s) => a + s.output_tokens, 0),
    cost_usd: Number(scenarios.reduce((a, s) => a + s.cost_usd, 0).toFixed(4)),
  },
  fixtures: Object.fromEntries([...new Set(specs.map((s) => s.fixture))].map((f) => [f, fixtureHash(f)])),
  scenarios,
};
writeFileSync(RESULTS, JSON.stringify(payload, null, 2) + "\n");
rmSync(shimDir, { recursive: true, force: true });

const allMet = scenarios.every((s) => s.met);
process.stdout.write(
  `\n${payload.totals.passed}/${payload.totals.trials} trials passed, ` +
    `${payload.totals.output_tokens} output tokens, $${payload.totals.cost_usd.toFixed(2)}, ` +
    `${payload.duration_s}s\n` +
    `results written to evals/scenarios/results.json\n` +
    (payload.full_run ? "" : "NOTE: not a full run; the runner will not accept these results.\n"),
);
process.exit(allMet ? 0 : 1);
