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

check("EVALS.md declares 4 valid fixtures", specValid.length === 4, specValid.join(", "));
check("EVALS.md declares 16 invalid fixtures", specInvalid.length === 16, `${specInvalid.length} found`);
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
check("every fixture has an expected output", missingExpected.length === 0, missingExpected.join(", ") || "20 of 20");
check("every fixture tree carries all five state files", malformedTrees.length === 0,
  malformedTrees.join(", ") || "SCHEMA.md section 1 satisfied");
check("git-level fixtures are two-commit (D-016)", setEq(gitFixtures, ["INV-08", "INV-14"]), gitFixtures.join(", "));

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

check("each invalid fixture expects exactly one error code", multiCode.length === 0, multiCode.join(", ") || "16 of 16");
check("every SCHEMA.md error code has a fixture", uncovered.length === 0, uncovered.join(", ") || `${covered.length} of ${codesInInventory.length} covered`);
check("no fixture expects an unknown error code", unknown.length === 0, unknown.join(", ") || "none");

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
  return { id, kind, status: "FAIL", detail: `unexpected exit ${r.status}; M1 implements the comparison` + prep };
}

const fixtureResults = [
  ...specValid.map((id) => runFixture(id, "valid")),
  ...specInvalid.map((id) => runFixture(id, "invalid")),
];
const scenarioResults = specScenarios.map((id) => ({
  id, kind: "scenario", status: "NOT_IMPLEMENTED",
  detail: "skill lands at M3; spec only",
}));

const all = [...fixtureResults, ...scenarioResults];
const tally = all.reduce((a, r) => ((a[r.status] = (a[r.status] ?? 0) + 1), a), {});
const green = inventoryOk && all.every((r) => r.status === "PASS");

/* ------------------------------------------------------------------- report */

const now = (process.env.DSK_NOW ?? new Date().toISOString()).slice(0, 10);
const milestone = process.env.DSK_MILESTONE ?? "M0";
const row = (r) => `| ${r.id} | ${r.kind} | ${r.status} | ${r.detail} |`;

const report = `# Eval report ${now} (${milestone})

Runner: \`evals/run.sh\`. Oracle: the validator plus git-level assertions, no
model judges any result (EVALS.md section 1.2).

**Overall: ${green ? "GREEN" : "RED"}** — ${Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(", ")}.

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
