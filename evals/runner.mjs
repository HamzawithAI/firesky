#!/usr/bin/env node
/**
 * dsk eval runner (D-017).
 *
 * Node built-ins only, so the red gate never depends on an install step.
 *
 * Two things happen here, in order:
 *
 *   1. INVENTORY. The expected fixture set is derived by scanning EVALS.md and
 *      SCHEMA.md, not from a hand-written list, so this check compares the
 *      repository against the spec documents themselves. It must pass at every
 *      milestone including M0.
 *   2. FIXTURES. Each fixture is run through the CLI. At M0 the CLI is a stub
 *      that exits 2, so every fixture reports NOT_IMPLEMENTED, which is red.
 *
 * Exit 0 only when the inventory passes AND every fixture and scenario passes.
 */
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync, rmSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EVALS = join(ROOT, "evals");
const WORK = join(EVALS, ".work");
const LEDGERS = ["decisions.md", "flags.md", "criteria.md", "signoffs.md"];
const REQUIRED_STATE_FILES = [...LEDGERS, "state.yaml"];

const read = (p) => readFileSync(join(ROOT, p), "utf8");
const uniqSorted = (xs) => [...new Set(xs)].sort();
const setEq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/* ---------------------------------------------------------------- inventory */

const evalsDoc = read("EVALS.md");
const schemaDoc = read("SCHEMA.md");

const specValid = uniqSorted(evalsDoc.match(/\bVAL-\d{2}\b/g) ?? []);
const specInvalid = uniqSorted(evalsDoc.match(/\bINV-\d{2}\b/g) ?? []);
const specScenarios = uniqSorted([...evalsDoc.matchAll(/^S([1-7]) /gm)].map((m) => `S${m[1]}`));

/* E4's fixture, clock and windows are derived from EVALS.md section 5 the same
   way the fixture inventory is derived from section 3: the spec document is the
   source, never a list hand-copied into this file (F-045). */
const e4Fixture = (/the tree is \*\*(VAL-\d{2})\*\*/.exec(evalsDoc) ?? [])[1] ?? null;
const e4Now = (/DSK_NOW=(\d{4}-\d{2}-\d{2})/.exec(evalsDoc) ?? [])[1] ?? null;
const e4Windows = (() => {
  const m = /three windows are \*\*(\d+), (\d+) and (\d+) days\*\*/.exec(evalsDoc);
  return m === null ? [] : [m[1], m[2], m[3]].map(Number);
})();
const e4Id = (w) => `E4-${String(w).padStart(2, "0")}`;

const section6 = schemaDoc.slice(schemaDoc.indexOf("## 6. Error code inventory"));
const codesInInventory = uniqSorted(section6.match(/\bERR_[A-Z_]+\b/g) ?? []);
const codesAnywhere = uniqSorted(schemaDoc.match(/\bERR_[A-Z_]+\b/g) ?? []);

const checks = [];
const check = (name, ok, detail) => { checks.push({ name, ok, detail }); return ok; };

const onDisk = (sub) =>
  existsSync(join(EVALS, sub)) ? readdirSync(join(EVALS, sub)).filter((d) => !d.startsWith(".")).sort() : [];

const diskValid = onDisk("fixtures/valid");
const diskInvalid = onDisk("fixtures/invalid");
const diskScenarios = onDisk("scenarios").filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")).sort();

check("EVALS.md declares 5 valid fixtures", specValid.length === 5, specValid.join(", "));
check("EVALS.md declares 18 invalid fixtures", specInvalid.length === 18, `${specInvalid.length} found`);
check("EVALS.md declares 7 scenarios", specScenarios.length === 7, specScenarios.join(", "));
check("valid fixtures on disk match EVALS.md", setEq(specValid, diskValid),
  setEq(specValid, diskValid) ? `${diskValid.length} present` : `spec=${specValid} disk=${diskValid}`);
check("invalid fixtures on disk match EVALS.md", setEq(specInvalid, diskInvalid),
  setEq(specInvalid, diskInvalid) ? `${diskInvalid.length} present` : `spec=${specInvalid} disk=${diskInvalid}`);
check("scenario specs on disk match EVALS.md", setEq(specScenarios, diskScenarios),
  setEq(specScenarios, diskScenarios) ? `${diskScenarios.length} present` : `spec=${specScenarios} disk=${diskScenarios}`);
check("SCHEMA.md error codes are consistent between sections", setEq(codesInInventory, codesAnywhere),
  `${codesInInventory.length} codes in the section 6 inventory`);

/* every fixture has an expected output, and the trees are well formed */
const expectedDir = join(EVALS, "expected");
const gitFixtures = [];
const missingExpected = [];
const malformedTrees = [];

for (const id of [...specValid, ...specInvalid]) {
  if (!existsSync(join(expectedDir, `${id}.json`))) missingExpected.push(id);
  const base = join(EVALS, specValid.includes(id) ? "fixtures/valid" : "fixtures/invalid", id);
  if (existsSync(join(base, "fixture.json"))) {
    gitFixtures.push(id);
    for (const side of ["base", "head"])
      for (const f of REQUIRED_STATE_FILES)
        if (!existsSync(join(base, side, "state", f))) malformedTrees.push(`${id}/${side}/state/${f}`);
  } else {
    for (const f of REQUIRED_STATE_FILES)
      if (!existsSync(join(base, "state", f))) malformedTrees.push(`${id}/state/${f}`);
  }
}
check("every fixture has an expected output", missingExpected.length === 0, missingExpected.join(", ") || `${specValid.length + specInvalid.length} of ${specValid.length + specInvalid.length}`);
check("every fixture tree carries all five state files", malformedTrees.length === 0,
  malformedTrees.join(", ") || "SCHEMA.md section 1 satisfied");
/* gitFixtures is collected valid-first, and setEq compares positionally, so sort
   before comparing. VAL-05 joined this set at M0-REVIEW section 5, INV-18 at
   M2-REVIEW section 3. */
check("git-level fixtures are two-commit (D-016)", setEq(uniqSorted(gitFixtures), ["INV-08", "INV-14", "INV-18", "VAL-05"]),
  uniqSorted(gitFixtures).join(", "));

/* Tamper check (D-020). Existence alone let a fixture emptied to zero bytes still
   report COMPLETE, which is precisely the weakening D-014 clause 4 forbids. This
   compares each fixture tree against its own expected file. It counts headings; it
   does not validate ledger content against SCHEMA.md, which is M1's work. */
const emptyFiles = [];
const countMismatch = [];
/* Measured, not asserted. These detail strings are printed into a committed
   report, and a hardcoded "110 files non-empty" stays convincing after the
   inventory grows (F-039). */
let nonEmptyCount = 0;
for (const id of [...specValid, ...specInvalid]) {
  const dir = join(EVALS, specValid.includes(id) ? "fixtures/valid" : "fixtures/invalid", id);
  const stateDir = existsSync(join(dir, "fixture.json")) ? join(dir, "head", "state") : join(dir, "state");
  for (const fname of REQUIRED_STATE_FILES) {
    const fp = join(stateDir, fname);
    if (!existsSync(fp)) continue;
    if (readFileSync(fp, "utf8").trim().length === 0) emptyFiles.push(`${id}/${fname}`);
    else nonEmptyCount++;
  }
  const expPath = join(expectedDir, `${id}.json`);
  if (!existsSync(expPath)) continue;
  const want = JSON.parse(readFileSync(expPath, "utf8")).counts;
  for (const l of LEDGERS) {
    const fp = join(stateDir, l);
    if (!existsSync(fp)) continue;
    const got = (readFileSync(fp, "utf8").match(/^### /gm) ?? []).length;
    const key = l.replace(/\.md$/, "");
    if (got !== want[key]) countMismatch.push(`${id}/${l}: tree has ${got}, expected file says ${want[key]}`);
  }
}
check("no fixture file is empty", emptyFiles.length === 0, emptyFiles.join(", ") || `${nonEmptyCount} files non-empty`);
check("fixture entry counts match their expected files", countMismatch.length === 0,
  countMismatch.join("; ") || `${specValid.length + specInvalid.length} of ${specValid.length + specInvalid.length} consistent`);

/* error-code coverage: many-to-one is expected, see F-006 */
const codeOf = {};
for (const id of specInvalid) {
  const p = join(expectedDir, `${id}.json`);
  if (!existsSync(p)) continue;
  const codes = uniqSorted(JSON.parse(readFileSync(p, "utf8")).errors.map((e) => e.code));
  codeOf[id] = codes;
}
const multiCode = Object.entries(codeOf).filter(([, c]) => c.length !== 1).map(([id]) => id);
const covered = uniqSorted(Object.values(codeOf).flat());
const uncovered = codesInInventory.filter((c) => !covered.includes(c));
const unknown = covered.filter((c) => !codesInInventory.includes(c));

check("each invalid fixture expects exactly one error code", multiCode.length === 0, multiCode.join(", ") || `${Object.keys(codeOf).length} of ${specInvalid.length}`);
check("every SCHEMA.md error code has a fixture", uncovered.length === 0, uncovered.join(", ") || `${covered.length} of ${codesInInventory.length} covered`);
check("no fixture expects an unknown error code", unknown.length === 0, unknown.join(", ") || "none");

/* E4, section 5. Same discipline as the E1 inventory: the spec names the tree,
   the clock and the windows, and this asserts the tree agrees. */
const e4Specified = e4Fixture !== null && e4Now !== null && e4Windows.length === 3;
check("EVALS.md names E4's fixture, clock and windows", e4Specified,
  e4Specified ? `${e4Fixture} at ${e4Now}, windows ${e4Windows.join(", ")}` : "section 5 is underspecified");
const e4MissingExpected = e4Windows.filter((w) => !existsSync(join(expectedDir, `${e4Id(w)}.json`)));
check("every E4 window has an expected output", e4Specified && e4MissingExpected.length === 0,
  e4MissingExpected.map(e4Id).join(", ") || `${e4Windows.length} of ${e4Windows.length}`);
check("E4's fixture is one of the declared valid fixtures", e4Fixture !== null && specValid.includes(e4Fixture),
  e4Fixture ?? "none named");

const inventoryOk = checks.every((c) => c.ok);

/* --inventory-only gates CI on the inventory alone. It must be green at every
   milestone, including M0, where the fixture run is red by design. */
if (process.argv.includes("--inventory-only")) {
  for (const c of checks) process.stdout.write(`${c.ok ? "PASS" : "FAIL"}  ${c.name} — ${c.detail}\n`);
  process.stdout.write(`\nInventory: ${inventoryOk ? "COMPLETE" : "INCOMPLETE"}\n`);
  process.exit(inventoryOk ? 0 : 1);
}

/* ----------------------------------------------------------------- fixtures */

const CLI = join(ROOT, "dist/cli.js");
const cliBuilt = existsSync(CLI);

function materialiseGitFixture(id, dir) {
  const work = join(WORK, id);
  rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });
  const git = (...args) => spawnSync("git", ["-C", work, ...args], { encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "evals@dsk.local");
  git("config", "user.name", "dsk evals");
  const manifest = JSON.parse(readFileSync(join(dir, "fixture.json"), "utf8"));
  for (const side of ["base", "head"]) {
    rmSync(join(work, "state"), { recursive: true, force: true });
    cpSync(join(dir, side, "state"), join(work, "state"), { recursive: true });
    git("add", "-A");
    const r = git("commit", "-q", "-m", manifest[`${side}_commit`]);
    if (r.status !== 0 && side === "head") return { work, ok: false, detail: "head commit produced no diff" };
  }
  const log = git("log", "--oneline").stdout.trim().split("\n").length;
  return { work, ok: log === 2, detail: log === 2 ? "two commits materialised" : `${log} commit(s)` };
}

/* E2 comparison predicate (F-008, plus the exit code F-021 added). Asserts ok,
   every error's code/file/id/line as a set, counts, and the process exit code.
   Message text and error order are deliberately not asserted. */
function compareToExpected(id, kind, actual, exitCode) {
  const want = JSON.parse(readFileSync(join(expectedDir, `${id}.json`), "utf8"));
  const problems = [];

  const wantExit = kind === "valid" ? 0 : 1;
  if (exitCode !== wantExit) problems.push(`exit ${exitCode}, expected ${wantExit}`);
  if (actual.ok !== want.ok) problems.push(`ok=${actual.ok}, expected ${want.ok}`);

  for (const k of ["decisions", "flags", "criteria", "signoffs"]) {
    const got = actual.counts?.[k];
    if (got !== want.counts[k]) problems.push(`counts.${k}=${got}, expected ${want.counts[k]}`);
  }

  const key = (e) => `${e.code}|${e.file}|${e.id ?? "null"}|${e.line}`;
  const got = new Set((actual.errors ?? []).map(key));
  const exp = new Set(want.errors.map(key));
  for (const k of exp) if (!got.has(k)) problems.push(`missing ${k}`);
  for (const k of got) if (!exp.has(k)) problems.push(`unexpected ${k}`);

  return problems;
}

function runFixture(id, kind) {
  const dir = join(EVALS, kind === "valid" ? "fixtures/valid" : "fixtures/invalid", id);
  let target = dir;
  let prep = "";
  if (existsSync(join(dir, "fixture.json"))) {
    const m = materialiseGitFixture(id, dir);
    if (!m.ok) return { id, kind, status: "FAIL", detail: `git fixture broken: ${m.detail}` };
    target = m.work;
    prep = " (git fixture materialised)";
  }
  if (!cliBuilt) return { id, kind, status: "NOT_IMPLEMENTED", detail: "dist/cli.js not built" + prep };

  const r = spawnSync(process.execPath, [CLI, "validate", "--json", target], { encoding: "utf8" });
  if (r.status === 2) return { id, kind, status: "NOT_IMPLEMENTED", detail: "dsk validate exits 2" + prep };

  let actual;
  try {
    actual = JSON.parse(r.stdout);
  } catch {
    return { id, kind, status: "FAIL", detail: `stdout is not JSON: ${(r.stdout || r.stderr).trim().slice(0, 120)}` };
  }

  const problems = compareToExpected(id, kind, actual, r.status);
  return problems.length === 0
    ? { id, kind, status: "PASS", detail: `matches expected/${id}.json` + prep }
    : { id, kind, status: "FAIL", detail: problems.join("; ") + prep };
}

const fixtureResults = [
  ...specValid.map((id) => runFixture(id, "valid")),
  ...specInvalid.map((id) => runFixture(id, "invalid")),
];
/* ------------------------------------------------------------------- E4, R20 */

/* Structural comparison: the expected file specifies the whole report, so this
   asserts the whole report. Key order is not asserted; everything else is. */
function deepEqual(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((x, i) => deepEqual(x, b[i]));
  }
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  return setEq(ka, kb) && ka.every((k) => deepEqual(a[k], b[k]));
}

/** First differing path, so a failure names the field rather than dumping JSON. */
function firstDiff(a, b, path = "") {
  if (deepEqual(a, b)) return null;
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object")
    return `${path || "value"}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`;
  if (Array.isArray(a) !== Array.isArray(b)) return `${path}: array/object mismatch`;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return `${path}: ${a.length} rows, expected ${b.length}`;
    for (let i = 0; i < a.length; i++) {
      const d = firstDiff(a[i], b[i], `${path}[${i}]`);
      if (d !== null) return d;
    }
    return `${path}: differs`;
  }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const d = firstDiff(a[k], b[k], path ? `${path}.${k}` : k);
    if (d !== null) return d;
  }
  return `${path}: differs`;
}

function runE4(window) {
  const id = e4Id(window);
  if (!e4Specified) return { id, kind: "staleness", status: "FAIL", detail: "EVALS.md section 5 is underspecified" };
  if (!cliBuilt) return { id, kind: "staleness", status: "NOT_IMPLEMENTED", detail: "dist/cli.js not built" };
  const target = join(EVALS, "fixtures/valid", e4Fixture);
  const r = spawnSync(process.execPath, [CLI, "staleness", "--json", "--window", String(window), target], {
    encoding: "utf8",
    env: { ...process.env, DSK_NOW: e4Now },
  });
  if (r.status === 2) return { id, kind: "staleness", status: "NOT_IMPLEMENTED", detail: "dsk staleness exits 2" };
  if (r.status !== 0) return { id, kind: "staleness", status: "FAIL", detail: `exit ${r.status}, expected 0 (R20 is a report, F-046)` };
  let actual;
  try {
    actual = JSON.parse(r.stdout);
  } catch {
    return { id, kind: "staleness", status: "FAIL", detail: `stdout is not JSON: ${(r.stdout || r.stderr).trim().slice(0, 120)}` };
  }
  const want = JSON.parse(readFileSync(join(expectedDir, `${id}.json`), "utf8"));
  const diff = firstDiff(actual, want);
  return diff === null
    ? { id, kind: "staleness", status: "PASS", detail: `${e4Fixture} at ${e4Now}, window ${window}` }
    : { id, kind: "staleness", status: "FAIL", detail: diff };
}

const e4Results = e4Windows.map(runE4);

/* Names the report file. Defaults to "adhoc", never to a milestone name. It used
   to default to "M0", which meant the documented `bash evals/run.sh` overwrote
   the committed M0 red-gate report with whatever the current tree produces —
   silently destroying the evidence that D-007's eval-first order was honoured.
   Naming a milestone report is now a deliberate act. Found by the M1
   adversarial pass. It also selects the D-023 expiry below, so it is read before
   the scenarios are graded, not just when the report is written. */
const milestone = process.env.DSK_MILESTONE ?? "adhoc";

/* ------------------------------------------------ D-023 and its M3 expiry */
/*
 * D-023 lets the seven unbuilt E5 suites report PENDING outside the exit code,
 * because PLAN.md gates M1 on E1, E2 and E3 while EVALS.md puts the E5 harness
 * at M3, which made the M1 gate literally unsatisfiable otherwise. F-033
 * records the real objection to that: the predicate was changed by the party it
 * grades. M1-REVIEW.md section 2.1 accepted it WITH A HARD EXPIRY — from the M3
 * gate onward E5 enters the exit code at its thresholds, and a PENDING scenario
 * at M3 is a failure — and instructed that the expiry be written into the runner
 * so it cannot be forgotten. This is that.
 *
 * Three independent legs turn the gate on, because one leg is one thing to
 * forget:
 *   1. DSK_MILESTONE names M3 or later.
 *   2. PLAN.md's own M3 row no longer reads "not started".
 *   3. The harness file exists, so there is nothing left to wait for.
 * Leg 2 fails CLOSED: if the M3 row cannot be found at all, the gate is on. A
 * false red is a report; a false green is the failure mode this expiry exists
 * to prevent.
 *
 * The thresholds themselves (4 of 5 soft, 5 of 5 hard, EVALS.md section 6) are
 * the M3 harness's job. This file's job is that PENDING can never be green from
 * M3 onward.
 */
const E5_GATED_FROM = 3;

/* Prefix match, not exact. The exact form let "M3-final" or "M3-rerun" yield no
   number and leave the gate off, which is one rename away from forgetting the
   expiry entirely. Found by the completeness critic (F-039). */
function milestoneNumber(name) {
  const m = /^M(\d+)/.exec(name.trim());
  return m === null ? null : Number(m[1]);
}

/** Reads PLAN.md's milestone table. Returns true when M3 is no longer pending. */
function planSaysM3Started() {
  let planDoc;
  try {
    planDoc = read("PLAN.md");
  } catch {
    return { started: true, detail: "PLAN.md unreadable; failing closed" };
  }
  const row = planDoc.split("\n").find((l) => /^\|\s*M3\s*\|/.test(l));
  if (row === undefined) return { started: true, detail: "no M3 row in PLAN.md; failing closed" };
  const status = (row.split("|")[4] ?? "").trim();
  if (status === "") return { started: true, detail: "M3 row has no status cell; failing closed" };
  const started = !/not started/i.test(status);
  return { started, detail: `PLAN.md M3 status: ${status}` };
}

/* Any executable file in evals/scenarios/ counts as the harness. Naming one
   exact filename meant renaming it to run-scenarios.mjs turned the leg off
   (F-039). The spec files themselves are markdown, so they cannot collide. */
const harnessFiles = existsSync(join(EVALS, "scenarios"))
  ? readdirSync(join(EVALS, "scenarios")).filter((f) => /\.(mjs|cjs|js|sh|ts)$/.test(f)).sort()
  : [];
const harnessExists = harnessFiles.length > 0;
const planM3 = planSaysM3Started();
const e5Legs = [
  { name: "DSK_MILESTONE is M3 or later", on: (milestoneNumber(milestone) ?? -1) >= E5_GATED_FROM, detail: milestone },
  { name: "PLAN.md says M3 has started", on: planM3.started, detail: planM3.detail },
  { name: "an E5 harness exists", on: harnessExists, detail: harnessExists ? harnessFiles.join(", ") : "no executable in evals/scenarios/" },
];
const e5Gated = e5Legs.some((l) => l.on);

/* ------------------------------------------------------ E5, from results.json */
/*
 * The runner NEVER invokes an LLM. E8 (AC4) requires this suite to run with no
 * network and no API keys, and CI runs on every push with neither, so the
 * harness is run deliberately and writes its verdicts to
 * evals/scenarios/results.json. This grades that file.
 *
 * It grades it adversarially, because the file is written by the party being
 * graded:
 *   - the threshold and trial count come from the scenario SPEC, never from
 *     results.json, so the harness cannot lower its own bar;
 *   - `met` is recomputed here from passed vs the spec's threshold, so the
 *     harness's own verdict is advisory;
 *   - the sha-256 of every scenario spec, of the fixture tree, of SKILL.md and
 *     of the harness itself are recorded at run time and compared here, so
 *     editing a spec, a fixture, the skill or a grader after a green run
 *     invalidates the results instead of silently keeping them green (D-020);
 *   - a partial run (--only or --trials) is marked full_run:false and refused.
 */
const RESULTS_PATH = join(EVALS, "scenarios", "results.json");
const sha16 = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);

/** Threshold, kind and trial count, read from the spec and never from results. */
function specGate(id) {
  const text = readFileSync(join(EVALS, "scenarios", `${id}.md`), "utf8");
  const fieldOf = (key) => (new RegExp(`^${key}:\\s*(.+)$`, "m").exec(text) ?? [])[1]?.trim();
  const threshold = fieldOf("threshold") ?? "";
  const need = Number((/^(\d+) of (\d+)$/.exec(threshold) ?? [])[1]);
  return { need, trials: Number(fieldOf("trials")), kind: fieldOf("kind"), threshold, hash: sha16(text) };
}

const LEDGER_PATHS = LEDGERS.map((l) => `state/${l}`).concat(["state/state.yaml"]);
const fixtureHash = (fixture) =>
  sha16(LEDGER_PATHS.map((f) => readFileSync(join(ROOT, fixture, f), "utf8")).join("\0"));

function gradeScenarios() {
  if (!harnessExists)
    return specScenarios.map((id) => ({
      id, kind: "scenario", status: "PENDING",
      detail: "E5 harness lands at M3 (PLAN.md M3.3); spec only",
    }));

  if (!existsSync(RESULTS_PATH))
    return specScenarios.map((id) => ({
      id, kind: "scenario", status: "FAIL",
      detail: "no evals/scenarios/results.json; run `node evals/scenarios/harness.mjs`",
    }));

  let doc;
  try {
    doc = JSON.parse(readFileSync(RESULTS_PATH, "utf8"));
  } catch (e) {
    return specScenarios.map((id) => ({ id, kind: "scenario", status: "FAIL", detail: `results.json unreadable: ${e.message}` }));
  }

  const harnessHash = sha16(readFileSync(join(EVALS, "scenarios", "harness.mjs"), "utf8"));
  const skillPath = join(ROOT, "templates", "claude", "skills", "dsk", "SKILL.md");
  const skillHash = existsSync(skillPath) ? sha16(readFileSync(skillPath, "utf8")) : "absent";
  const global = [];
  if (doc.full_run !== true) global.push("results came from a partial run (--only or --trials)");
  if (doc.harness_sha256 !== harnessHash) global.push("results predate the current harness.mjs; rerun it");
  if (doc.skill_sha256 !== skillHash) global.push("results graded a different SKILL.md; rerun the harness");
  for (const [fixture, want] of Object.entries(doc.fixtures ?? {})) {
    if (fixtureHash(fixture) !== want) global.push(`${fixture} changed since the run; rerun the harness`);
  }

  return specScenarios.map((id) => {
    const gate = specGate(id);
    const row = (doc.scenarios ?? []).find((s) => s.id === id);
    if (row === undefined)
      return { id, kind: "scenario", status: "FAIL", detail: "no result recorded for this scenario" };
    const problems = [...global];
    if (row.spec_sha256 !== gate.hash) problems.push(`${id}.md changed since the run; rerun the harness`);
    if (row.trials !== gate.trials) problems.push(`ran ${row.trials} trials, the spec requires ${gate.trials}`);
    // The gate, recomputed here from the spec. results.json's own `met` is not read.
    const met = Number.isInteger(gate.need) && row.passed >= gate.need && row.trials === gate.trials;
    const detail = `${row.passed}/${row.trials}, needs ${gate.threshold} (${gate.kind}), ` +
      `${row.output_tokens} output tokens, $${(row.cost_usd ?? 0).toFixed(2)}`;
    if (problems.length > 0)
      return { id, kind: "scenario", status: "FAIL", detail: `${detail}; ${problems.join("; ")}` };
    return { id, kind: "scenario", status: met ? "PASS" : "FAIL", detail };
  });
}

const scenarioResults = gradeScenarios();

const all = [...fixtureResults, ...e4Results, ...scenarioResults];
const tally = all.reduce((a, r) => ((a[r.status] = (a[r.status] ?? 0) + 1), a), {});
const pending = all.filter((r) => r.status === "PENDING").length;
/* With the expiry on, PENDING is simply not PASS, so it counts against the run. */
const green = inventoryOk && all.every((r) => r.status === "PASS" || (r.status === "PENDING" && !e5Gated));

/* ------------------------------------------------------------------- report */

const now = (process.env.DSK_NOW ?? new Date().toISOString()).slice(0, 10);
const row = (r) => `| ${r.id} | ${r.kind} | ${r.status} | ${r.detail} |`;

const report = `# Eval report ${now} (${milestone})

Runner: \`evals/run.sh\`. Oracle: the validator plus git-level assertions, no
model judges any result (EVALS.md section 1.2).

**Overall: ${green ? "GREEN" : "RED"}** — ${Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(", ")}.

## E5 gating (D-023 and its M3 expiry)

E5 scenario gating is **${e5Gated ? "ON" : "OFF"}**${e5Gated ? ", so a PENDING scenario is a failure" : `, so ${pending} PENDING suite(s) sit outside this exit code`}.
D-023 lets unbuilt scenario suites report PENDING outside the exit code;
M1-REVIEW.md section 2.1 accepted that with a hard expiry at M3. Any one leg
turns the gate on, and leg 2 fails closed.

| Leg | State | Detail |
|---|---|---|
${e5Legs.map((l) => `| ${l.name} | ${l.on ? "ON" : "off"} | ${l.detail} |`).join("\n")}

## Inventory

Derived by scanning EVALS.md and SCHEMA.md, then compared against the tree.

| Check | Result | Detail |
|---|---|---|
${checks.map((c) => `| ${c.name} | ${c.ok ? "PASS" : "FAIL"} | ${c.detail} |`).join("\n")}

Inventory: **${inventoryOk ? "COMPLETE" : "INCOMPLETE"}**

## Fixtures

| ID | Kind | Status | Detail |
|---|---|---|---|
${fixtureResults.map(row).join("\n")}

## E4, staleness (R20)

Clock pinned through \`DSK_NOW\`; the report is graded on stdout, not on an exit
code (F-046). Fixture, clock and windows are derived from EVALS.md section 5.

| ID | Kind | Status | Detail |
|---|---|---|---|
${e4Results.map(row).join("\n")}

## Scenarios

| ID | Kind | Status | Detail |
|---|---|---|---|
${scenarioResults.map(row).join("\n")}

## Error-code coverage

${codesInInventory.map((c) => `- \`${c}\` — ${Object.entries(codeOf).filter(([, cs]) => cs.includes(c)).map(([id]) => id).join(", ") || "UNCOVERED"}`).join("\n")}
`;

mkdirSync(join(EVALS, "reports"), { recursive: true });
const reportPath = join(EVALS, "reports", `${now}-${milestone}.md`);
writeFileSync(reportPath, report);

process.stdout.write(report + `\nreport written to evals/reports/${now}-${milestone}.md\n`);
process.exit(green ? 0 : 1);
