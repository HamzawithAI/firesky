#!/usr/bin/env node
/**
 * Re-grade a committed E5 run from its artifacts, with zero new trials
 * (M3-REVIEW-2.md section 3.1).
 *
 * WHAT THIS IS FOR. Section 3.1 authorises one specific thing: re-grading all
 * thirty-five committed artifacts of an existing run under an AMENDED validator,
 * to establish that no verdict outside the scenario under repair changed. Any
 * change elsewhere escalates to a full fresh run. The eval runner cannot answer
 * that question on its own, because it grades only the newest results file and
 * reports a seal mismatch as a failure of the whole row — which is correct for a
 * gate and useless for an invariance check, since amending the validator is the
 * very thing being checked.
 *
 * WHAT THIS IS NOT. It is not a gate and it is not a way around one. It writes
 * no results file, it is not imported by the runner, `evals/run.sh` does not call
 * it, and nothing it prints can turn a red suite green. The gate stays
 * `evals/runner.mjs`, whose seal checks are untouched: after an amendment those
 * seals SHOULD say the run is stale, and they do. This tool separates two
 * questions the gate deliberately fuses — "were these inputs the run's inputs"
 * and "do these artifacts still produce these verdicts" — and answers only the
 * second, out loud, for a human ruling.
 *
 * The replay is the runner's own, imported from replay.mjs rather than copied,
 * so this cannot grade a different reconstruction than the gate does.
 *
 * Usage:
 *   node evals/scenarios/regrade.mjs                       the newest committed run
 *   node evals/scenarios/regrade.mjs <results.json>         a named run
 *   node evals/scenarios/regrade.mjs --expect-changes S3    verdict changes allowed only there
 *   node evals/scenarios/regrade.mjs --json                 machine-readable
 *
 * Exit 0 when every scenario's re-derived verdict matches what was recorded,
 * except in scenarios named by --expect-changes. Exit 1 otherwise, which under
 * section 3.1 means stop and report.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { regradeTrial, sha16 } from "./replay.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CLI = join(ROOT, "dist", "cli.js");
const EVALS = join(ROOT, "evals");
const RESULTS_DIR = join(EVALS, "scenarios", "results");
const read = (p) => readFileSync(p, "utf8");

const argOf = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
};
const json = process.argv.includes("--json");
const expectChanges = (argOf("--expect-changes") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const named = process.argv.slice(2).find((a) => a.endsWith(".json"));

if (!existsSync(CLI)) {
  process.stderr.write("regrade: dist/cli.js is absent. Run `npm run build` first.\n");
  process.exit(2);
}

const resultsPath = named
  ? join(ROOT, named)
  : (() => {
      const files = existsSync(RESULTS_DIR) ? readdirSync(RESULTS_DIR).filter((f) => f.endsWith(".json")).sort() : [];
      return files.length === 0 ? null : join(RESULTS_DIR, files[files.length - 1]);
    })();

if (resultsPath === null || !existsSync(resultsPath)) {
  process.stderr.write("regrade: no results file to re-grade\n");
  process.exit(2);
}

const doc = JSON.parse(read(resultsPath));

/** Threshold, kind, trials, fixture and token, read from the spec on disk. */
function specGate(id) {
  const text = read(join(EVALS, "scenarios", `${id}.md`));
  const fieldOf = (key) => (new RegExp(`^${key}:\\s*(.+)$`, "m").exec(text) ?? [])[1]?.trim();
  const threshold = fieldOf("threshold") ?? "";
  return {
    id,
    need: Number((/^(\d+) of (\d+)$/.exec(threshold) ?? [])[1]),
    trials: Number(fieldOf("trials")),
    kind: fieldOf("kind"),
    threshold,
    fixture: fieldOf("fixture"),
    forbiddenToken: fieldOf("forbidden-token") ?? "",
    hash: sha16(text),
  };
}

const rows = [];
let changed = 0;
let unexpected = 0;

for (const s of doc.scenarios ?? []) {
  const gate = specGate(s.id);
  const trials = Array.isArray(s.results) ? s.results : [];
  const flips = [];
  let passed = 0;
  const problems = [];

  for (const tr of trials) {
    const r = regradeTrial(ROOT, CLI, gate, tr);
    if (r.pass) passed++;
    if (r.pass !== tr.pass) flips.push(`t${tr.trial}: ${tr.pass ? "pass→fail" : "fail→pass"}`);
    /* A disagreement between recorded and re-derived is the finding, not an
       error; artifact-integrity problems are. Both are kept, separated. */
    for (const p of r.problems) if (!/recorded pass=/.test(p)) problems.push(p);
  }

  const specChanged = s.spec_sha256 !== undefined && s.spec_sha256 !== gate.hash;
  if (specChanged) problems.push(`${s.id}.md changed since the run, so this replay grades against a different spec`);

  const recordedMet = s.passed >= gate.need;
  const derivedMet = passed >= gate.need && trials.length === gate.trials;
  const verdictChanged = passed !== s.passed;
  if (verdictChanged) changed++;
  if (verdictChanged && !expectChanges.includes(s.id)) unexpected++;

  rows.push({
    id: s.id,
    recorded: `${s.passed}/${s.trials}`,
    rederived: `${passed}/${trials.length}`,
    threshold: gate.threshold,
    kind: gate.kind,
    recorded_met: recordedMet,
    derived_met: derivedMet,
    changed: verdictChanged,
    expected_change: expectChanges.includes(s.id),
    flips,
    problems,
  });
}

/* The seals, reported rather than enforced. This is the whole reason the tool
   exists separately: after an authorised amendment the seals SHOULD be stale,
   and the gate is right to say so. Printing them keeps that visible instead of
   letting a quiet re-grade imply the run's inputs are unchanged. */
function inputHashesNow() {
  const hashOf = (p, what) => (existsSync(p) ? sha16(read(p)) : `${what} is missing from the tree`);
  const walk = (d) =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith(".ts") ? [join(d, e.name)] : []);
  const srcFiles = walk(join(ROOT, "src")).sort();
  return {
    harness_sha256: hashOf(join(EVALS, "scenarios", "harness.mjs"), "harness.mjs"),
    graders_sha256: hashOf(join(EVALS, "scenarios", "graders.mjs"), "graders.mjs"),
    skill_sha256: hashOf(join(ROOT, "templates", "claude", "skills", "dsk", "SKILL.md"), "SKILL.md"),
    validator_sha256: sha16(srcFiles.map((f) => `${f.slice(ROOT.length + 1)}\0${read(f)}`).join("\0")),
  };
}
const now = inputHashesNow();
const seals = Object.keys(now).map((k) => ({ input: k.replace(/_sha256$/, ""), recorded: doc[k], now: now[k], same: doc[k] === now[k] }));

const summary = {
  run: relative(ROOT, resultsPath),
  trials: (doc.scenarios ?? []).reduce((a, s) => a + (s.results?.length ?? 0), 0),
  scenarios_changed: changed,
  unexpected_changes: unexpected,
  expect_changes: expectChanges,
  seals,
  rows,
};

if (json) {
  process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
} else {
  process.stdout.write(
    `Re-grade of ${summary.run} under the tree as it stands now.\n` +
      `${summary.trials} trials replayed, zero new trials, no model consulted.\n` +
      `This is an audit, not a gate: it writes nothing and the eval runner is unaffected.\n\n` +
      `Sealed inputs, reported not enforced (a stale seal after an authorised amendment is correct):\n` +
      seals.map((s) => `  ${s.same ? "same    " : "CHANGED "} ${s.input}  ${s.recorded} -> ${s.now}\n`).join("") +
      `\n| Scenario | Recorded | Re-derived | Threshold | Met then | Met now | Verdict |\n` +
      `|---|---|---|---|---|---|---|\n` +
      rows
        .map(
          (r) =>
            `| ${r.id} | ${r.recorded} | ${r.rederived} | ${r.threshold} (${r.kind}) | ` +
            `${r.recorded_met ? "yes" : "no"} | ${r.derived_met ? "yes" : "no"} | ` +
            `${r.changed ? (r.expected_change ? "CHANGED, authorised" : "CHANGED, NOT AUTHORISED") : "unchanged"} |\n`,
        )
        .join("") +
      rows
        .filter((r) => r.flips.length > 0 || r.problems.length > 0)
        .map((r) => `\n${r.id}: ${[...r.flips, ...r.problems].join("; ")}`)
        .join("") +
      `\n\n${changed} scenario(s) changed verdict, ${unexpected} of them outside --expect-changes ${JSON.stringify(expectChanges)}.\n`,
  );
}

process.exit(unexpected === 0 ? 0 : 1);
