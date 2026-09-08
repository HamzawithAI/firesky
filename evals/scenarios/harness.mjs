#!/usr/bin/env node
/**
 * E5 agent-behaviour harness (EVALS.md section 6, PLAN.md M3.3).
 *
 * Seven scenarios, five trials each, thirty-five headless runs of the real
 * Claude Code CLI against a disposable copy of VAL-01 with the kit's skill
 * installed. Grading is deterministic: the validator, the tree the run left
 * behind, and string assertions against a scripted census. No model judges any
 * result (EVALS.md section 1.2).
 *
 * WHY THIS IS NOT PART OF `evals/run.sh`.
 * The runner must never invoke an LLM. E8 (AC4) requires the full validator
 * suite to run with no network and no API keys present, and CI runs on every
 * push with neither. So this harness is run deliberately and writes its
 * evidence into the repository; the runner grades that evidence offline.
 *
 * THE EVIDENCE PROTOCOL (D-032, M3-REVIEW.md section 4).
 *
 * 4.1 Nothing is ever overwritten. Each run writes one timestamped file under
 *     evals/scenarios/results/, and refuses an existing path unless --force is
 *     given. The old single results.json could be, and once nearly was,
 *     destroyed by a later partial run (F-061).
 * 4.2 Every trial commits its raw artifacts beside the verdict: the headless
 *     JSON the CLI printed, the agent's result text, and the diff of the whole
 *     trial tree against the seed commit. Each is sha-256'd in the results file.
 * 4.3 The runner re-derives every pass count from those artifacts. It rebuilds
 *     each trial tree from the seed plus the committed diff, runs the same
 *     graders over it, and compares. No integer written here is load-bearing:
 *     `passed`, `met` and each trial's `pass` are recorded for humans and are
 *     recomputed before they gate anything.
 * 4.4 Known limit, accepted for v0.1 and recorded rather than glossed: a locally
 *     executed run is audited testimony. The artifacts make forgery costly and
 *     auditable — a forged run has to be internally consistent across thirty-five
 *     diffs that reproduce their own verdicts under the shipped validator — not
 *     impossible. Full non-forgeability needs trusted execution and is out of
 *     scope. F-055 stays open as the honest statement of that limit.
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
 *   node evals/scenarios/harness.mjs --only S3,S4     a subset (marked partial)
 *   node evals/scenarios/harness.mjs --trials 1       fewer trials (marked partial)
 *   node evals/scenarios/harness.mjs --concurrency 4  parallel trials
 *   node evals/scenarios/harness.mjs --force          overwrite an existing path
 */
import { createHash } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { LEDGERS, gradeTrial, observe, readLedgers, seedTrial } from "./graders.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCENARIO_DIR = join(ROOT, "evals", "scenarios");
const RESULTS_DIR = join(SCENARIO_DIR, "results");
const ARTIFACT_DIR = join(SCENARIO_DIR, "artifacts");
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

const git = (cwd, ...args) => spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });

/** A `dsk` shim on PATH, so the agent under test can run the real CLI. */
function makeShim() {
  const dir = mkdtempSync(join(tmpdir(), "dsk-bin-"));
  const shim = join(dir, "dsk");
  writeFileSync(shim, `#!/bin/sh\nexec ${process.execPath} ${JSON.stringify(CLI)} "$@"\n`, { mode: 0o755 });
  return dir;
}

/**
 * The whole trial tree against its seed commit, as one patch (D-032 section 4.2).
 *
 * `git add -A` first, so files the agent created — under `state/`, beside it, or
 * inside the installed `.claude/` — are in the patch rather than invisible to
 * it. This is the artifact the runner replays; it is deliberately wider than the
 * four ledger files the graders assert on, so a reviewer can see everything the
 * run touched even where no clause currently fires on it.
 */
function treeDiff(dir) {
  git(dir, "add", "-A");
  const r = git(dir, "diff", "--cached", "--no-color", "HEAD");
  return r.status === 0 ? r.stdout : `harness: git diff failed (exit ${r.status})\n${r.stderr}`;
}

/** One artifact file, recorded as {path, sha256, bytes} for the runner to verify. */
function writeArtifact(runId, name, body) {
  const dir = join(ARTIFACT_DIR, runId);
  mkdirSync(dir, { recursive: true });
  const full = join(dir, name);
  writeFileSync(full, body);
  return { path: relative(ROOT, full), sha256: sha(body), bytes: Buffer.byteLength(body) };
}

/* -------------------------------------------------------------- trial runner */

function runClaude(dir, prompt, shimDir) {
  return new Promise((resolve) => {
    const child = spawn(
      "claude",
      ["-p", prompt, "--permission-mode", "acceptEdits", "--allowedTools", "Bash,Read,Write,Edit",
       "--output-format", "json"],
      { cwd: dir, env: { ...process.env, PATH: `${shimDir}:${process.env.PATH}` } },
    );
    /* Chunks are collected as Buffers and decoded once at the end. `spawn` has
       no `encoding` option — the old code passed the spawnSync one, so chunks
       were concatenated as strings and a multi-byte character split across two
       of them was corrupted, in the very text S5 and S6 assert on (finding 46). */
    const out = [], err = [];
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => err.push(d));
    child.on("close", (code) =>
      resolve({ code, out: Buffer.concat(out).toString("utf8"), err: Buffer.concat(err).toString("utf8") }));
    child.on("error", (e) => resolve({ code: -1, out: "", err: String(e) }));
  });
}

async function runTrial(spec, n, shimDir, runId) {
  const dir = seedTrial(ROOT, spec.fixture, mkdtempSync(join(tmpdir(), "dsk-e5-")));
  try {
    const before = readLedgers(dir);
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
    const errorDetail = (err || out).trim().slice(0, 200) || `exit ${code}`;
    const graded = gradeTrial(spec, o, text, cliError, errorDetail);

    /* 4.2: the raw artifacts, written before the trial tree is destroyed. */
    const stem = `${spec.id}-t${n}`;
    const artifacts = {
      raw: writeArtifact(runId, `${stem}.raw.json`, out === "" ? err : out),
      output: writeArtifact(runId, `${stem}.output.txt`, text),
      diff: writeArtifact(runId, `${stem}.tree.diff`, treeDiff(dir)),
    };

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
      cli_error: cliError,
      cli_error_detail: cliError ? errorDetail : null,
      artifacts,
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

/* ------------------------------------------------------------------- hashes */

/**
 * Everything the run depended on, hashed before the first trial starts.
 *
 * The old set covered the specs, the fixture and SKILL.md, and computed them
 * after the trial loop — so it attested to the post-run tree, and left the three
 * slash-command files (S6's prompt is literally "Run /status") and the validator
 * itself unpinned (findings 7 and 10). This set covers every input the trials
 * actually depend on: the graders, the harness, the skill, each command file,
 * and the validator's own source. There is no 'absent' sentinel: a missing skill
 * throws here rather than becoming a claimable hash value.
 */
function inputHashes() {
  const commandDir = join(ROOT, "templates", "claude", "commands");
  const commands = Object.fromEntries(
    readdirSync(commandDir).filter((f) => f.endsWith(".md")).sort()
      .map((f) => [f, sha(read(join(commandDir, f)))]),
  );
  const srcDir = join(ROOT, "src");
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith(".ts") ? [join(d, e.name)] : []);
  const validator = sha(walk(srcDir).sort().map((f) => `${relative(ROOT, f)}\0${read(f)}`).join("\0"));
  return {
    harness_sha256: sha(read(fileURLToPath(import.meta.url))),
    graders_sha256: sha(read(join(SCENARIO_DIR, "graders.mjs"))),
    skill_sha256: sha(read(join(ROOT, "templates", "claude", "skills", "dsk", "SKILL.md"))),
    commands_sha256: commands,
    validator_sha256: validator,
  };
}

const LEDGER_PATHS = LEDGERS.concat(["state/state.yaml"]);
const fixtureHash = (fixture) => sha(LEDGER_PATHS.map((f) => read(join(ROOT, fixture, f))).join("\0"));

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
const force = process.argv.includes("--force");
const specs = loadSpecs().filter((s) => only === null || only.split(",").includes(s.id));
if (specs.length === 0) {
  process.stderr.write(`harness: no scenarios matched --only ${only}\n`);
  process.exit(2);
}

/* 4.1: a timestamped path per run, and a refusal rather than a clobber. The run
   id is fixed before the first trial, so the artifacts and the results file that
   names them can never belong to different runs. */
const runId = new Date().toISOString().replace(/[:.]/g, "-").replace(/-\d{3}Z$/, "Z");
const resultsPath = join(RESULTS_DIR, `${runId}.json`);
if (!force && (existsSync(resultsPath) || existsSync(join(ARTIFACT_DIR, runId)))) {
  process.stderr.write(`harness: run ${runId} already has evidence on disk. Pass --force to overwrite it.\n`);
  process.exit(2);
}

const hashes = inputHashes();
const shimDir = makeShim();
const started = Date.now();
const scenarios = [];

process.stdout.write(`E5 harness: ${specs.length} scenarios, concurrency ${concurrency}, run ${runId}\n\n`);

for (const spec of specs) {
  const trials = trialsOverride === null ? spec.trials : Number(trialsOverride);
  const results = await pool(
    Array.from({ length: trials }, (_, i) => i + 1),
    concurrency,
    (n) => runTrial(spec, n, shimDir, runId),
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
    forbidden_token: spec.forbiddenToken,
    paired_action: spec.pairedAction,
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

const payload = {
  run_id: runId,
  generated: new Date().toISOString(),
  ...hashes,
  full_run: only === null && trialsOverride === null,
  duration_s: Math.round((Date.now() - started) / 1000),
  totals: {
    trials: scenarios.reduce((a, s) => a + s.trials, 0),
    passed: scenarios.reduce((a, s) => a + s.passed, 0),
    output_tokens: scenarios.reduce((a, s) => a + s.output_tokens, 0),
    input_tokens: scenarios.reduce((a, s) => a + s.results.reduce((b, r) => b + (r.usage?.input ?? 0), 0), 0),
    cost_usd: Number(scenarios.reduce((a, s) => a + s.cost_usd, 0).toFixed(4)),
  },
  fixtures: Object.fromEntries([...new Set(specs.map((s) => s.fixture))].map((f) => [f, fixtureHash(f)])),
  scenarios,
};

mkdirSync(RESULTS_DIR, { recursive: true });
writeFileSync(resultsPath, JSON.stringify(payload, null, 2) + "\n");
rmSync(shimDir, { recursive: true, force: true });

process.stdout.write(
  `\n${payload.totals.passed}/${payload.totals.trials} trials passed, ` +
    `${payload.totals.output_tokens} output tokens, $${payload.totals.cost_usd.toFixed(2)}, ` +
    `${payload.duration_s}s\n` +
    `results   ${relative(ROOT, resultsPath)}\n` +
    `artifacts ${relative(ROOT, join(ARTIFACT_DIR, runId))}/  (${payload.totals.trials * 3} files)\n` +
    `Commit both now: the evidence outlives the session that produced it (F-061).\n` +
    (payload.full_run ? "" : "NOTE: not a full run; the runner will not accept these results.\n"),
);
process.exit(scenarios.every((s) => s.met) ? 0 : 1);
