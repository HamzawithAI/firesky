#!/usr/bin/env node
/**
 * E6 cross-runtime smoke (EVALS.md section 7, AC5).
 *
 * "Scenarios S1 to S3 executed on one non-Claude runtime using only the
 * AGENTS.md snippet. Manual execution and grading acceptable in v0.1, results
 * logged in the report."
 *
 * Execution is manual because the runtime is not ours to drive: Cursor, Copilot
 * and Gemini CLI have no common headless interface, and this machine has no
 * non-Claude agent CLI and no non-Anthropic API key. Grading, however, does not
 * have to be manual, and manual grading is where a cross-runtime smoke usually
 * turns into "it looked fine to me". So this script does both halves it can do:
 * it builds the trial tree, and it grades whatever the other runtime left
 * behind.
 *
 * It grades through the SHIPPED CLI and git, not through the E5 harness's
 * internals, which is deliberate twice over: a user checking another runtime's
 * output would reach for `dsk validate`, and E6 stays independent of the E5
 * graders instead of inheriting a bug from them.
 *
 * The tree gets AGENTS.md and NOTHING ELSE. No .claude/, no skill, no slash
 * commands. If the snippet cannot carry the rules on its own, E6 must fail,
 * which is the entire point of AC5.
 *
 * Usage:
 *   node evals/scenarios/e6.mjs setup            build the three trial trees
 *   node evals/scenarios/e6.mjs grade <dir>...   grade them
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CLI = join(ROOT, "dist", "cli.js");
const WORK = join(ROOT, "evals", ".work", "e6");
const FIXTURE = "evals/fixtures/valid/VAL-01";
const read = (p) => readFileSync(p, "utf8");
const git = (cwd, ...args) => spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });

/* The prompts are read from the scenario specs, never retyped, so E6 asks the
   other runtime exactly what E5 asks Claude Code. */
function promptOf(id) {
  const text = read(join(ROOT, "evals", "scenarios", `${id}.md`));
  const m = /claude -p "((?:[^"\\]|\\.)*)"/.exec(text);
  if (m === null) throw new Error(`${id}.md has no prompt`);
  return m[1].replace(/\\"/g, '"');
}

const SCENARIOS = ["S1", "S2", "S3"];

function setup() {
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  for (const id of SCENARIOS) {
    const dir = join(WORK, id);
    mkdirSync(dir, { recursive: true });
    cpSync(join(ROOT, FIXTURE, "state"), join(dir, "state"), { recursive: true });
    // The snippet, and only the snippet. This is what AC5 is about.
    writeFileSync(join(dir, "AGENTS.md"), read(join(ROOT, "templates", "AGENTS.dsk.md")));
    git(dir, "init", "-q");
    git(dir, "config", "user.email", "evals@dsk.local");
    git(dir, "config", "user.name", "dsk evals");
    git(dir, "add", "-A");
    git(dir, "commit", "-q", "-m", "seed: fixture tree plus the AGENTS.md snippet");
  }
  process.stdout.write(
    `E6 trees built under evals/.work/e6/, each holding ${FIXTURE} plus AGENTS.md\n` +
      `and nothing else — no skill, no slash commands.\n\n` +
      `Open each directory in the non-Claude runtime, make sure it loads AGENTS.md\n` +
      `(rename it to .cursorrules, GEMINI.md or copilot-instructions.md if that is\n` +
      `what the runtime reads — the content is what E6 grades, not the filename),\n` +
      `and give it exactly this prompt:\n\n` +
      SCENARIOS.map((id) => `  ${id}  ${join(WORK, id)}\n      ${promptOf(id)}\n`).join("\n") +
      `\nThen grade, without committing anything in those trees:\n\n` +
      `  node evals/scenarios/e6.mjs grade ${SCENARIOS.map((id) => join(WORK, id)).join(" ")}\n`,
  );
}

/** Working-tree state versus the seed commit, read through git and the CLI. */
function grade(dir, id) {
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok, detail });

  if (!existsSync(join(dir, "state"))) {
    add("the trial tree exists", false, `no state/ under ${dir}`);
    return { id, dir, pass: false, checks };
  }

  const v = spawnSync(process.execPath, [CLI, "validate", "--json", dir], { encoding: "utf8" });
  add("dsk validate exits 0", v.status === 0, `exit ${v.status}`);

  // Append-only, read straight from git: no removed line anywhere under state/.
  const diff = git(dir, "diff", "--unified=0", "--", "state/").stdout;
  const removed = diff.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---"));
  add("the diff against the seed commit removes no line", removed.length === 0,
    removed.length === 0 ? "append-only" : removed.slice(0, 3).join(" | "));

  const decisions = read(join(dir, "state", "decisions.md"));
  const flags = read(join(dir, "state", "flags.md"));
  const seedDecisions = git(dir, "show", "HEAD:state/decisions.md").stdout;

  if (id === "S1") {
    const ids = [...decisions.matchAll(/^### (D-\d{3})/gm)].map((m) => m[1]);
    add("a new D-### entry exists", ids.length > 1, ids.join(",") || "none");
  }
  if (id === "S2") {
    const ids = [...flags.matchAll(/^### (F-\d{3})/gm)].map((m) => m[1]);
    const owners = [...flags.matchAll(/^owner:\s*(.*)$/gm)].map((m) => m[1].trim());
    add("a new F-### entry exists", ids.length > 1, ids.join(",") || "none");
    add("every flag carries a real owner", owners.length === ids.length && owners.every((o) => o !== "" && !/^(tbd|unknown|none|team|n\/a)$/i.test(o)),
      owners.join(",") || "none");
  }
  if (id === "S3") {
    // D-001 byte-identical: the seed entry text must survive verbatim.
    const entry = (text) => {
      const lines = text.split("\n");
      const s = lines.findIndex((l) => l.startsWith("### D-001"));
      if (s === -1) return null;
      let e = lines.length;
      for (let i = s + 1; i < lines.length; i++) if (lines[i].startsWith("### ")) { e = i; break; }
      return lines.slice(s, e).join("\n");
    };
    add("D-001 is byte-identical, status line included", entry(decisions) !== null && entry(decisions) === entry(seedDecisions),
      entry(decisions) === entry(seedDecisions) ? "unchanged" : "D-001 was rewritten");
    add("a superseding entry names D-001 in supersedes:", /^supersedes:\s*D-001\s*$/m.test(decisions),
      /^supersedes:\s*D-001\s*$/m.test(decisions) ? "found" : "none appended");
  }

  return { id, dir, pass: checks.every((c) => c.ok), checks };
}

const [, , cmd, ...dirs] = process.argv;

if (!existsSync(CLI)) {
  process.stderr.write("e6: dist/cli.js is absent. Run `npm run build` first.\n");
  process.exit(2);
}

if (cmd === "setup") {
  setup();
} else if (cmd === "grade") {
  if (dirs.length === 0) {
    process.stderr.write("e6: grade needs at least one directory\n");
    process.exit(2);
  }
  const results = dirs.map((d) => {
    const dir = resolve(d);
    const id = SCENARIOS.find((s) => dir.endsWith(s)) ?? "S?";
    return grade(dir, id);
  });
  for (const r of results) {
    process.stdout.write(`${r.pass ? "PASS" : "FAIL"}  ${r.id}  ${r.dir}\n`);
    for (const c of r.checks) process.stdout.write(`        ${c.ok ? "ok  " : "FAIL"} ${c.name} — ${c.detail}\n`);
  }
  const out = join(ROOT, "evals", "scenarios", "e6-results.json");
  writeFileSync(out, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), results }, null, 2) + "\n");
  process.stdout.write(`\nwritten to evals/scenarios/e6-results.json\n`);
  process.exit(results.every((r) => r.pass) ? 0 : 1);
} else {
  process.stderr.write("usage: e6.mjs setup | e6.mjs grade <dir>...\n");
  process.exit(2);
}
