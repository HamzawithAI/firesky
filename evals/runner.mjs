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
import {
  readFileSync, existsSync, readdirSync, mkdirSync, mkdtempSync, writeFileSync, rmSync, cpSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { gradeTrial, observe, readLedgers, seedTrial } from "./scenarios/graders.mjs";

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
check("EVALS.md declares 19 invalid fixtures", specInvalid.length === 19, `${specInvalid.length} found`);
check("EVALS.md declares 7 scenarios", specScenarios.length === 7, specScenarios.join(", "));
check("valid fixtures on disk match EVALS.md", setEq(specValid, diskValid),
  setEq(specValid, diskValid) ? `${diskValid.length} present` : `spec=${specValid} disk=${diskValid}`);
check("invalid fixtures on disk match EVALS.md", setEq(specInvalid, diskInvalid),
  setEq(specInvalid, diskInvalid) ? `${diskInvalid.length} present` : `spec=${specInvalid} disk=${diskInvalid}`);
check("scenario specs on disk match EVALS.md", setEq(specScenarios, diskScenarios),
  setEq(specScenarios, diskScenarios) ? `${diskScenarios.length} present` : `spec=${specScenarios} disk=${diskScenarios}`);
check("SCHEMA.md error codes are consistent between sections", setEq(codesInInventory, codesAnywhere),
  `${codesInInventory.length} codes in the section 6 inventory`);

/* E5 thresholds are stated in EVALS.md section 6 and restated in each scenario
   spec, and until now nothing compared the two — so editing one line of one
   S<n>.md turned a hard 5 of 5 into a green 1 of 5 with nothing anywhere
   objecting (finding 9). This is the same discipline F-045 forced onto E4: the
   spec document is the source, never a value hand-copied beside it. */
const evalsThresholds = Object.fromEntries(
  [...evalsDoc.matchAll(/^S(\d) .*?\b(Soft|Hard), (\d+) of (\d+)\.\s*$/gm)]
    .map((m) => [`S${m[1]}`, { kind: m[2].toLowerCase(), need: Number(m[3]), trials: Number(m[4]) }]),
);
const thresholdDrift = [];
for (const id of specScenarios) {
  const want = evalsThresholds[id];
  if (want === undefined) { thresholdDrift.push(`${id}: EVALS.md section 6 states no threshold`); continue; }
  const specPath = join(EVALS, "scenarios", `${id}.md`);
  if (!existsSync(specPath)) { thresholdDrift.push(`${id}.md is missing`); continue; }
  const text = readFileSync(specPath, "utf8");
  const fieldOf = (key) => (new RegExp(`^${key}:\\s*(.+)$`, "m").exec(text) ?? [])[1]?.trim();
  const m = /^(\d+) of (\d+)$/.exec(fieldOf("threshold") ?? "");
  const kind = fieldOf("kind");
  const trials = Number(fieldOf("trials"));
  if (m === null) { thresholdDrift.push(`${id}.md: unreadable threshold '${fieldOf("threshold")}'`); continue; }
  if (Number(m[1]) !== want.need || Number(m[2]) !== want.trials)
    thresholdDrift.push(`${id}.md says ${m[1]} of ${m[2]}, EVALS.md section 6 says ${want.need} of ${want.trials}`);
  if (kind !== want.kind) thresholdDrift.push(`${id}.md is '${kind}', EVALS.md section 6 says '${want.kind}'`);
  if (trials !== want.trials) thresholdDrift.push(`${id}.md runs ${trials} trials against a ${want.trials}-trial threshold`);
}
check("scenario thresholds match EVALS.md section 6", thresholdDrift.length === 0,
  thresholdDrift.join("; ") || `${specScenarios.length} of ${specScenarios.length} agree`);

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

/* ------------------------------------------------ E5, graded from artifacts */
/*
 * The runner NEVER invokes an LLM. E8 (AC4) requires this suite to run with no
 * network and no API keys, and CI runs on every push with neither, so the
 * harness is run deliberately and commits its evidence; this grades that
 * evidence offline.
 *
 * D-032 (M3-REVIEW.md section 4) changed what "grades" means here. The old gate
 * read one integer per scenario, `row.passed`, and never opened the thirty-five
 * trial records beside it: setting `passed = trials` and `results = []`
 * reproduced a byte-identical GREEN report (finding 4). Nothing the graded party
 * writes is load-bearing any more.
 *
 *   - Thresholds, trial counts and the forbidden token come from the scenario
 *     spec, which the inventory above has already cross-checked against
 *     EVALS.md section 6. The results file cannot lower its own bar.
 *   - EVERY TRIAL IS RE-GRADED. Its committed tree diff is applied to a freshly
 *     seeded trial tree, and the same graders the harness ran are run over the
 *     result. A scenario's pass count is the count of re-derived passes; the
 *     recorded `pass`, `passed` and `met` are compared and reported as
 *     agreement or disagreement, never used as the answer.
 *   - Every artifact is verified against the sha-256 recorded at run time.
 *   - Every input the run depended on is re-hashed: the harness, the graders,
 *     SKILL.md, each slash-command file, the validator's own source, and each
 *     fixture tree named by a scenario SPEC rather than by the results file
 *     (an empty `fixtures` map used to disable the check silently, finding 5).
 *   - A partial run is refused; duplicate scenario rows are refused.
 *   - A results file that exists is ALWAYS graded, even with no harness on
 *     disk. It used to be skipped in favour of PENDING, so a recorded 0/5 could
 *     be turned green by deleting one file (finding 6).
 *
 * 4.4's known limit stands and is not papered over: a locally executed run is
 * audited testimony. Re-grading makes a forged run expensive — thirty-five
 * diffs that each have to reproduce their own verdict under the shipped
 * validator — not impossible. F-055 stays open.
 */
const RESULTS_DIR = join(EVALS, "scenarios", "results");
const sha16 = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);

/** The newest committed run. Timestamped ids sort lexicographically. */
function latestResultsFile() {
  if (!existsSync(RESULTS_DIR)) return null;
  const files = readdirSync(RESULTS_DIR).filter((f) => f.endsWith(".json")).sort();
  return files.length === 0 ? null : join(RESULTS_DIR, files[files.length - 1]);
}

/** Threshold, kind, trials and token, read from the spec and never from results. */
function specGate(id) {
  const text = readFileSync(join(EVALS, "scenarios", `${id}.md`), "utf8");
  const fieldOf = (key) => (new RegExp(`^${key}:\\s*(.+)$`, "m").exec(text) ?? [])[1]?.trim();
  const threshold = fieldOf("threshold") ?? "";
  const need = Number((/^(\d+) of (\d+)$/.exec(threshold) ?? [])[1]);
  return {
    id,
    need,
    trials: Number(fieldOf("trials")),
    kind: fieldOf("kind"),
    threshold,
    fixture: fieldOf("fixture"),
    forbiddenToken: fieldOf("forbidden-token") ?? "",
    hash: sha16(text),
  };
}

const LEDGER_PATHS = LEDGERS.map((l) => `state/${l}`).concat(["state/state.yaml"]);
const fixtureHash = (fixture) =>
  sha16(LEDGER_PATHS.map((f) => readFileSync(join(ROOT, fixture, f), "utf8")).join("\0"));

/**
 * The same input hashes the harness records, recomputed from the tree now.
 *
 * A missing file yields a sentinel naming it rather than throwing or, worse,
 * yielding a value a results file could claim. `absent` used to be both the
 * sentinel and a legal hash string, so a results file asserting it let the
 * milestone's entire deliverable be deleted with E5 still green (finding 7).
 * Sentinels here contain spaces; a sha-256 prefix never does, so no results
 * file can match one.
 */
function inputHashesNow() {
  const hashOf = (p, what) => (existsSync(p) ? sha16(readFileSync(p, "utf8")) : `${what} is missing from the tree`);
  const commandDir = join(ROOT, "templates", "claude", "commands");
  const commands = existsSync(commandDir)
    ? Object.fromEntries(readdirSync(commandDir).filter((f) => f.endsWith(".md")).sort()
        .map((f) => [f, sha16(readFileSync(join(commandDir, f), "utf8"))]))
    : {};
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith(".ts") ? [join(d, e.name)] : []);
  const srcDir = join(ROOT, "src");
  const srcFiles = existsSync(srcDir) ? walk(srcDir).sort() : [];
  return {
    harness_sha256: hashOf(join(EVALS, "scenarios", "harness.mjs"), "harness.mjs"),
    graders_sha256: hashOf(join(EVALS, "scenarios", "graders.mjs"), "graders.mjs"),
    skill_sha256: hashOf(join(ROOT, "templates", "claude", "skills", "dsk", "SKILL.md"), "SKILL.md"),
    commands_sha256: commands,
    validator_sha256: srcFiles.length === 0
      ? "src/ is missing from the tree"
      : sha16(srcFiles.map((f) => `${f.slice(ROOT.length + 1)}\0${readFileSync(f, "utf8")}`).join("\0")),
  };
}

/**
 * One trial, re-graded from its committed artifacts (D-032 section 4.3).
 *
 * Seed a trial tree exactly as the harness does, apply the committed diff, run
 * the same graders. The verdict this produces is the one that counts.
 */
function regradeTrial(gate, trial) {
  const problems = [];
  const bodies = {};
  for (const kind of ["raw", "output", "diff"]) {
    const meta = trial.artifacts?.[kind];
    if (meta === undefined) { problems.push(`trial ${trial.trial}: no ${kind} artifact recorded`); continue; }
    const p = join(ROOT, meta.path);
    if (!existsSync(p)) { problems.push(`trial ${trial.trial}: ${meta.path} is missing`); continue; }
    const body = readFileSync(p, "utf8");
    if (sha16(body) !== meta.sha256) problems.push(`trial ${trial.trial}: ${meta.path} changed since the run`);
    bodies[kind] = body;
  }
  if (problems.length > 0) return { pass: false, problems };

  const dir = seedTrial(ROOT, gate.fixture, mkdtempSync(join(tmpdir(), "dsk-regrade-")));
  try {
    const before = readLedgers(dir);
    if (bodies.diff.trim() !== "") {
      const applied = spawnSync("git", ["-C", dir, "apply", "--whitespace=nowarn", "-"],
        { input: bodies.diff, encoding: "utf8" });
      if (applied.status !== 0)
        return { pass: false, problems: [`trial ${trial.trial}: the committed diff does not apply to a fresh seed — ${(applied.stderr || "").trim().slice(0, 140)}`] };
    }
    let payload = null;
    try {
      payload = JSON.parse(bodies.raw);
    } catch {
      /* an unparseable payload is a CLI error, exactly as the harness read it */
    }
    const text = payload?.result ?? bodies.output;
    const cliError = payload === null || payload.is_error === true;
    const graded = gradeTrial(gate, observe(dir, before, CLI), text, cliError, "recorded CLI error");
    if (graded.pass !== trial.pass)
      problems.push(`trial ${trial.trial}: recorded pass=${trial.pass}, re-derived ${graded.pass}`);
    return { pass: graded.pass, problems, checks: graded.checks };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function gradeScenarios() {
  const resultsPath = latestResultsFile();

  if (resultsPath === null) {
    /* PENDING survives only while there is genuinely nothing to grade. Once a
       results file exists it is graded, harness present or not (finding 6). */
    if (!e5Gated && !harnessExists)
      return specScenarios.map((id) => ({
        id, kind: "scenario", status: "PENDING",
        detail: "E5 harness lands at M3 (PLAN.md M3.3); spec only",
      }));
    return specScenarios.map((id) => ({
      id, kind: "scenario", status: "FAIL",
      detail: "no run under evals/scenarios/results/; run `node evals/scenarios/harness.mjs`",
    }));
  }

  const graded = resultsPath.slice(ROOT.length + 1);
  if (!cliBuilt)
    return specScenarios.map((id) => ({
      id, kind: "scenario", status: "NOT_IMPLEMENTED", detail: "dist/cli.js not built; cannot re-grade",
    }));

  let doc;
  try {
    doc = JSON.parse(readFileSync(resultsPath, "utf8"));
  } catch (e) {
    return specScenarios.map((id) => ({ id, kind: "scenario", status: "FAIL", detail: `${graded} unreadable: ${e.message}` }));
  }

  const now = inputHashesNow();
  const global = [];
  if (doc.full_run !== true) global.push("results came from a partial run (--only or --trials)");
  for (const key of ["harness_sha256", "graders_sha256", "skill_sha256", "validator_sha256"])
    if (doc[key] !== now[key]) global.push(`${key.replace(/_sha256$/, "")} changed since the run; rerun the harness`);
  for (const [file, want] of Object.entries(now.commands_sha256))
    if ((doc.commands_sha256 ?? {})[file] !== want) global.push(`templates/claude/commands/${file} changed since the run; rerun the harness`);
  for (const file of Object.keys(doc.commands_sha256 ?? {}))
    if (now.commands_sha256[file] === undefined) global.push(`the run used a command file that no longer exists: ${file}`);

  const seen = new Set();
  return specScenarios.map((id) => {
    const gate = specGate(id);
    const rows = (doc.scenarios ?? []).filter((s) => s.id === id);
    if (rows.length === 0)
      return { id, kind: "scenario", status: "FAIL", detail: `no result recorded for this scenario in ${graded}` };
    if (rows.length > 1 || seen.has(id))
      return { id, kind: "scenario", status: "FAIL", detail: `${rows.length} rows recorded for ${id}; first-wins is not a gate` };
    seen.add(id);
    const row = rows[0];

    const problems = [...global];
    if (row.spec_sha256 !== gate.hash) problems.push(`${id}.md changed since the run; rerun the harness`);
    if (row.trials !== gate.trials) problems.push(`ran ${row.trials} trials, the spec requires ${gate.trials}`);
    if (row.fixture !== gate.fixture) problems.push(`ran against ${row.fixture}, the spec names ${gate.fixture}`);
    /* The fixture check is driven by the SPEC's fixture, so an empty `fixtures`
       map in the results file disables nothing (finding 5). */
    if (existsSync(join(ROOT, gate.fixture)) && (doc.fixtures ?? {})[gate.fixture] !== fixtureHash(gate.fixture))
      problems.push(`${gate.fixture} is not the tree these results were graded against`);

    const trials = Array.isArray(row.results) ? row.results : [];
    if (trials.length !== gate.trials) problems.push(`${trials.length} trial records for ${gate.trials} trials`);

    /* The gate: re-derived, not read. */
    const regraded = trials.map((tr) => regradeTrial(gate, tr));
    for (const r of regraded) problems.push(...r.problems);
    const passed = regraded.filter((r) => r.pass).length;
    if (row.passed !== passed) problems.push(`results.json claims ${row.passed} passes, the artifacts yield ${passed}`);

    const met = Number.isInteger(gate.need) && passed >= gate.need && trials.length === gate.trials;
    const detail =
      `${passed}/${gate.trials} re-derived from artifacts, needs ${gate.threshold} (${gate.kind}), ` +
      `${row.output_tokens} output tokens, $${(row.cost_usd ?? 0).toFixed(2)}`;
    if (problems.length > 0)
      return { id, kind: "scenario", status: "FAIL", detail: `${detail}; ${problems.join("; ")}` };
    return { id, kind: "scenario", status: met ? "PASS" : "FAIL", detail };
  });
}

const e5ResultsFile = latestResultsFile();
const scenarioResults = gradeScenarios();

/* ---------------------------------------------------- E6, cross-runtime (AC5) */
/*
 * E6 enters the suite and the exit code here (M3-REVIEW-2.md section 4, closing
 * F-060). Until that ruling, `E6` appeared nowhere in this file, in run.sh or in
 * the workflow, so half of M3's gate could neither redden nor green — the gate
 * existed in PLAN.md and in nothing executable.
 *
 * ABSENT OR UNGRADED IS A FAIL, NOT A PENDING. The ruling is explicit about
 * why the D-023 precedent does not transfer: that pattern protected an earlier
 * gate from a suite belonging to a FUTURE milestone, and E6 belongs to this one.
 * A red suite while the gate is unmet is the truthful state, and it clears when
 * the results file lands and grades.
 *
 * What is checked, and what is trusted. Execution is manual by EVALS.md section
 * 7, so unlike E5 there is nothing to re-derive: the trial trees live under a
 * gitignored `.work/` and the only artifact that survives is the results file.
 * This is weaker evidence than E5's and is graded as such rather than dressed up
 * — see the known limit in EVALS.md section 7. What can be checked is checked:
 *   - the file exists, parses, and names a runtime that is not Claude;
 *   - it covers exactly the scenarios EVALS.md section 7 names, one row each;
 *   - each row's `pass` is RE-DERIVED from its own checks rather than read, so a
 *     hand-edited `pass: true` beside a failing check is reported;
 *   - the snippet and the validator are re-hashed, so an E6 run stops counting
 *     the moment the artifact it tested or the oracle that graded it changes.
 *     This series changes both, which is precisely why the check exists.
 */
const E6_RESULTS = join(EVALS, "scenarios", "e6-results.json");

/** E6's scenario set, derived from EVALS.md section 7, never typed here. */
const e6Scenarios = (() => {
  const m = /Scenarios S(\d) to S(\d) executed on one non-Claude runtime/.exec(evalsDoc);
  if (m === null) return null;
  const out = [];
  for (let n = Number(m[1]); n <= Number(m[2]); n++) out.push(`S${n}`);
  return out;
})();

function gradeE6() {
  const id = "E6";
  const kind = "cross-runtime";
  if (e6Scenarios === null)
    return [{ id, kind, status: "FAIL", detail: "EVALS.md section 7 does not name E6's scenario range" }];
  if (!existsSync(E6_RESULTS))
    return [{
      id, kind, status: "FAIL",
      detail: "evals/scenarios/e6-results.json is absent; E6 is due at this gate " +
        "(M3-REVIEW-2.md section 4). Run `node evals/scenarios/e6.mjs setup`, then grade and commit the file.",
    }];

  let doc;
  try {
    doc = JSON.parse(readFileSync(E6_RESULTS, "utf8"));
  } catch (e) {
    return [{ id, kind, status: "FAIL", detail: `e6-results.json unreadable: ${e.message}` }];
  }

  const problems = [];
  const runtime = (doc.runtime ?? "").trim();
  if (runtime === "") problems.push("no runtime recorded; AC5 is a claim about a specific runtime");
  else if (/claude/i.test(runtime)) problems.push(`runtime '${runtime}' is not a non-Claude runtime`);

  const now = inputHashesNow();
  const snippetPath = join(ROOT, "templates", "AGENTS.dsk.md");
  const snippetNow = existsSync(snippetPath) ? sha16(readFileSync(snippetPath, "utf8")) : "the snippet is missing from the tree";
  if (doc.snippet_sha256 !== snippetNow) problems.push("templates/AGENTS.dsk.md changed since the run; rerun E6");
  if (doc.validator_sha256 !== now.validator_sha256) problems.push("the validator changed since the run; rerun E6");

  const rows = Array.isArray(doc.results) ? doc.results : [];
  const covered = rows.map((r) => r.id);
  for (const want of e6Scenarios)
    if (covered.filter((c) => c === want).length !== 1)
      problems.push(`${covered.filter((c) => c === want).length} rows for ${want}, expected exactly 1`);
  for (const got of new Set(covered))
    if (!e6Scenarios.includes(got)) problems.push(`unexpected scenario ${got}`);

  /* Re-derived, not read: the same discipline D-032 imposes on E5's integers. */
  let passed = 0;
  for (const r of rows) {
    const checks = Array.isArray(r.checks) ? r.checks : [];
    if (checks.length === 0) { problems.push(`${r.id}: no checks recorded`); continue; }
    const derived = checks.every((c) => c.ok === true);
    if (derived !== r.pass) problems.push(`${r.id}: recorded pass=${r.pass}, its own checks yield ${derived}`);
    if (derived) passed++;
    else for (const c of checks.filter((c) => c.ok !== true)) problems.push(`${r.id}: ${c.name} — ${c.detail}`);
  }

  const detail = `${passed}/${e6Scenarios.length} scenarios on '${runtime || "unnamed"}', ` +
    `graded ${doc.generated ?? "undated"}`;
  if (problems.length > 0) return [{ id, kind, status: "FAIL", detail: `${detail}; ${problems.join("; ")}` }];
  return [{ id, kind, status: "PASS", detail }];
}

const e6Results = gradeE6();

const all = [...fixtureResults, ...e4Results, ...scenarioResults, ...e6Results];
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

## Scenarios (E5, graded from committed artifacts)

${e5ResultsFile === null ? "No run under `evals/scenarios/results/`." : `Graded run: \`${e5ResultsFile.slice(ROOT.length + 1)}\`.`}
Every pass count below is **re-derived** (D-032 section 4.3): each trial's
committed tree diff is applied to a freshly seeded trial, the same graders the
harness ran are run over the result, and the count is the count of re-derived
passes. The integers in the results file are compared against that and reported
as disagreement, never used as the answer. Thresholds come from the scenario
specs, which the inventory has already reconciled with EVALS.md section 6.

| ID | Kind | Status | Detail |
|---|---|---|---|
${scenarioResults.map(row).join("\n")}

## E6, cross-runtime smoke (AC5)

Wired into this runner and this exit code by M3-REVIEW-2.md section 4, closing
F-060. An absent or ungraded \`evals/scenarios/e6-results.json\` is a **FAIL**,
not a PENDING: the D-023 pattern protected earlier gates from suites belonging to
future milestones, and E6 belongs to this one. Execution is manual (EVALS.md
section 7), so what is checked here is the results file: the runtime it names,
the snippet and validator hashes it was produced under, one row per scenario, and
each row's verdict re-derived from its own checks.

| ID | Kind | Status | Detail |
|---|---|---|---|
${e6Results.map(row).join("\n")}

## Error-code coverage

${codesInInventory.map((c) => `- \`${c}\` — ${Object.entries(codeOf).filter(([, cs]) => cs.includes(c)).map(([id]) => id).join(", ") || "UNCOVERED"}`).join("\n")}
`;

mkdirSync(join(EVALS, "reports"), { recursive: true });
const reportPath = join(EVALS, "reports", `${now}-${milestone}.md`);
writeFileSync(reportPath, report);

process.stdout.write(report + `\nreport written to evals/reports/${now}-${milestone}.md\n`);
process.exit(green ? 0 : 1);
