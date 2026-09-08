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
 * WHAT CHANGED WHEN E6 BECAME GATE-BEARING (M3-REVIEW-2.md section 4, F-068).
 * Until this ruling nothing consumed E6's results, so three holes in this grader
 * were recorded and left (F-060, and the M3 re-run report section 5). A suite
 * that gates a milestone cannot keep them, because a vacuous pass on a gate is
 * exactly the F-057 mistake the previous review spent itself closing:
 *
 *   1. The scenario id came from the directory NAME, and an unrecognised name
 *      fell through to `S?`, which runs no scenario-specific check and prints
 *      PASS. Ids now come from the setup manifest, and a directory the manifest
 *      does not know is refused rather than graded.
 *   2. The baseline was unpinned. `git diff` sees neither staged nor committed
 *      work, so a runtime that ran `git add` or `git commit` made both git
 *      checks vacuously true — including "D-001 is byte-identical", which
 *      compares against HEAD. The seed commit is recorded at setup, HEAD is
 *      asserted to still be it, and the diff is taken against HEAD explicitly so
 *      staged work is visible.
 *   3. No `dsk` was on PATH, though the snippet instructs the runtime to run it.
 *      Setup now writes a shim OUTSIDE the trial trees and prints the one export
 *      line that puts it on PATH.
 *
 * The results file also records what it is evidence OF: which runtime produced
 * it, and the hashes of the two inputs that decide whether it still means
 * anything — the snippet under test and the validator that graded it. The runner
 * checks both, the same way it checks an E5 run's seals.
 *
 * Usage:
 *   node evals/scenarios/e6.mjs setup                        build the three trial trees
 *   node evals/scenarios/e6.mjs grade --runtime <name> <dir>...   grade them
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CLI = join(ROOT, "dist", "cli.js");
const WORK = join(ROOT, "evals", ".work", "e6");
const MANIFEST = join(WORK, "manifest.json");
const BIN = join(WORK, "bin");
const FIXTURE = "evals/fixtures/valid/VAL-01";
const SNIPPET = join(ROOT, "templates", "AGENTS.dsk.md");
const OUT = join(ROOT, "evals", "scenarios", "e6-results.json");

const read = (p) => readFileSync(p, "utf8");
const sha16 = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);
const git = (cwd, ...args) => spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });

/* The prompts are read from the scenario specs, never retyped, so E6 asks the
   other runtime exactly what E5 asks Claude Code. */
function promptOf(id) {
  const text = read(join(ROOT, "evals", "scenarios", `${id}.md`));
  const m = /claude -p "((?:[^"\\]|\\.)*)"/.exec(text);
  if (m === null) throw new Error(`${id}.md has no prompt`);
  return m[1].replace(/\\"/g, '"');
}

/**
 * The scenarios E6 covers, read from EVALS.md section 7 rather than typed here
 * (the F-045 discipline). The runner derives the same set from the same
 * sentence, so the two cannot drift into disagreeing about what E6 is.
 */
function scenariosFromSpec() {
  const evalsDoc = read(join(ROOT, "EVALS.md"));
  const m = /Scenarios S(\d) to S(\d) executed on one non-Claude runtime/.exec(evalsDoc);
  if (m === null) throw new Error("EVALS.md section 7 does not name E6's scenario range");
  const out = [];
  for (let n = Number(m[1]); n <= Number(m[2]); n++) out.push(`S${n}`);
  return out;
}

/**
 * The validator's own source, hashed byte-for-byte the way the E5 harness and
 * the runner hash it, so the runner can compare an E6 results file against the
 * tree with the same predicate it uses on an E5 run.
 */
function validatorHash() {
  const walk = (d) =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(d, e.name)) : e.name.endsWith(".ts") ? [join(d, e.name)] : []);
  const files = walk(join(ROOT, "src")).sort();
  return sha16(files.map((f) => `${f.slice(ROOT.length + 1)}\0${read(f)}`).join("\0"));
}

function setup() {
  const SCENARIOS = scenariosFromSpec();
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(BIN, { recursive: true });

  /* Hole 3: the snippet tells the runtime to run `dsk validate`, and nothing
     ever put a `dsk` on PATH for it to run. The shim lives outside the trial
     trees, because the trees hold AGENTS.md and nothing else. */
  const shim = join(BIN, "dsk");
  writeFileSync(shim, `#!/bin/sh\nexec ${process.execPath} ${JSON.stringify(CLI)} "$@"\n`, { mode: 0o755 });

  const trials = [];
  for (const id of SCENARIOS) {
    const dir = join(WORK, id);
    mkdirSync(dir, { recursive: true });
    cpSync(join(ROOT, FIXTURE, "state"), join(dir, "state"), { recursive: true });
    // The snippet, and only the snippet. This is what AC5 is about.
    writeFileSync(join(dir, "AGENTS.md"), read(SNIPPET));
    git(dir, "init", "-q");
    git(dir, "config", "user.email", "evals@dsk.local");
    git(dir, "config", "user.name", "dsk evals");
    git(dir, "add", "-A");
    git(dir, "commit", "-q", "-m", "seed: fixture tree plus the AGENTS.md snippet");
    const seed = git(dir, "rev-parse", "HEAD").stdout.trim();
    trials.push({ id, dir, seed_commit: seed, prompt: promptOf(id) });
  }

  /* Hole 1 and hole 2: the id and the baseline both come from here, so a
     renamed directory is refused rather than silently graded as `S?`, and a
     commit made after setup is visible instead of erasing the diff. */
  writeFileSync(
    MANIFEST,
    JSON.stringify(
      { fixture: FIXTURE, snippet_sha256: sha16(read(SNIPPET)), created: new Date().toISOString(), trials },
      null,
      2,
    ) + "\n",
  );

  process.stdout.write(
    `E6 trees built under evals/.work/e6/, each holding ${FIXTURE} plus AGENTS.md\n` +
      `and nothing else — no skill, no slash commands.\n\n` +
      `1. Put the kit's CLI on PATH, so the runtime can do what the snippet tells it\n` +
      `   to do after a write. Run this in the shell you drive the runtime from:\n\n` +
      `     export PATH="${BIN}:$PATH"\n\n` +
      `   Check it: \`dsk validate ${join(WORK, "S1")}\` should print "is valid" and exit 0.\n\n` +
      `2. Open each directory below in the non-Claude runtime, make sure it loads\n` +
      `   AGENTS.md (rename it to .cursorrules, GEMINI.md or copilot-instructions.md\n` +
      `   if that is what the runtime reads — the content is what E6 grades, not the\n` +
      `   filename), and give it exactly this prompt:\n\n` +
      SCENARIOS.map((id) => `  ${id}  ${join(WORK, id)}\n      ${promptOf(id)}\n`).join("\n") +
      `\n3. Do not commit, stage, or \`git add\` anything in those trees. The grader\n` +
      `   asserts HEAD is still the seed commit and diffs against it; a commit made\n` +
      `   after setup is a failed check, not a silent pass.\n\n` +
      `4. Grade, naming the runtime you used:\n\n` +
      `     node evals/scenarios/e6.mjs grade --runtime "<cursor|gemini|copilot|...>" \\\n` +
      `       ${SCENARIOS.map((id) => join(WORK, id)).join(" \\\n       ")}\n\n` +
      `   It writes evals/scenarios/e6-results.json. Commit that file: it is the only\n` +
      `   artifact that survives, because evals/.work/ is gitignored, and the eval\n` +
      `   runner now FAILS while it is absent (M3-REVIEW-2.md section 4).\n`,
  );
}

/** Working-tree state versus the pinned seed commit, read through git and the CLI. */
function grade(trial) {
  const { dir, id, seed_commit } = trial;
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok, detail });

  if (!existsSync(join(dir, "state"))) {
    add("the trial tree exists", false, `no state/ under ${dir}`);
    return { id, dir, seed_commit, head_commit: null, pass: false, checks };
  }

  /* Hole 2. Both git checks below compare against HEAD, so a runtime that
     committed its own work would compare the rewrite against itself and pass.
     Assert the baseline first, and report it as a check so the failure is in the
     evidence rather than in a message nobody kept. */
  const head = git(dir, "rev-parse", "HEAD").stdout.trim();
  add("HEAD is still the seed commit from setup", head === seed_commit,
    head === seed_commit ? head.slice(0, 8) : `HEAD is ${head.slice(0, 8)}, seed was ${seed_commit.slice(0, 8)}`);

  const v = spawnSync(process.execPath, [CLI, "validate", "--json", dir], { encoding: "utf8" });
  add("dsk validate exits 0", v.status === 0, `exit ${v.status}`);

  /* `diff HEAD` rather than `diff`: the plain form shows unstaged changes only,
     so `git add` alone used to empty it. */
  const diff = git(dir, "diff", "HEAD", "--unified=0", "--", "state/").stdout;
  const removed = diff.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---"));
  add("the diff against the seed commit removes no line", removed.length === 0,
    removed.length === 0 ? "append-only" : removed.slice(0, 3).join(" | "));

  const decisions = read(join(dir, "state", "decisions.md"));
  const flags = read(join(dir, "state", "flags.md"));
  const seedDecisions = git(dir, "show", `${seed_commit}:state/decisions.md`).stdout;

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

  return { id, dir, seed_commit, head_commit: head, pass: checks.every((c) => c.ok), checks };
}

/* --------------------------------------------------------------------- main */

const argOf = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
};

const [, , cmd] = process.argv;
const dirs = process.argv.slice(3).filter((a) => !a.startsWith("--") && a !== argOf("--runtime"));

/**
 * Build before doing anything, exactly as `evals/run.sh` does and for exactly the
 * same reason (F-070, confirmed by this session's adversarial pass).
 *
 * E6 grades through `dist/cli.js` and seals a hash of `src/**` + '/*' + `.ts`. Nothing
 * automated invokes this script, so run.sh's mandatory rebuild never covered it,
 * and `existsSync(CLI)` was the only guard: an edit to src that was never
 * compiled produced a results file sealed with source that did not build the
 * binary that graded it. Reproduced: the same seal over the same trial trees
 * gave 3/3 PASS against a stale dist and 2/3 FAIL after `npm run build`. Since
 * M3-REVIEW-2.md section 4 made E6 exit-code-bearing, that is a gate hole, and
 * the src-hash-as-proxy-for-dist reasoning only holds if the build is forced here.
 */
function ensureBuild() {
  if (!existsSync(join(ROOT, "node_modules", "typescript"))) {
    process.stderr.write(
      "e6: no local TypeScript; grading the existing dist/ as-is. The validator hash this\n" +
        "    run seals is computed from src/, so make sure dist/ was built from it.\n",
    );
    return;
  }
  const built = spawnSync("npm", ["run", "--silent", "build"], { cwd: ROOT, encoding: "utf8" });
  if (built.status !== 0) {
    process.stderr.write(`e6: the TypeScript build failed. Refusing to grade a stale dist/.\n${built.stderr ?? ""}`);
    process.exit(2);
  }
}

ensureBuild();

if (!existsSync(CLI)) {
  process.stderr.write("e6: dist/cli.js is absent. Run `npm run build` first.\n");
  process.exit(2);
}

if (cmd === "setup") {
  setup();
} else if (cmd === "grade") {
  const runtime = (argOf("--runtime") ?? "").trim();
  if (runtime === "") {
    process.stderr.write(
      "e6: grade needs --runtime \"<name>\". AC5 is a claim about a specific non-Claude\n" +
        "    runtime, and a results file that does not say which one is evidence of nothing.\n",
    );
    process.exit(2);
  }
  if (/claude/i.test(runtime)) {
    process.stderr.write(`e6: '${runtime}' is not a non-Claude runtime. EVALS.md section 7 and AC5 require one.\n`);
    process.exit(2);
  }
  if (dirs.length === 0) {
    process.stderr.write("e6: grade needs at least one directory\n");
    process.exit(2);
  }
  if (!existsSync(MANIFEST)) {
    process.stderr.write("e6: no evals/.work/e6/manifest.json. Run `node evals/scenarios/e6.mjs setup` first.\n");
    process.exit(2);
  }
  const manifest = JSON.parse(read(MANIFEST));
  /* The snippet the trees actually carry is the one setup wrote, and the results
     file seals the one on disk at grade time. Those are the same file at two
     moments, and nothing compared them: a snippet edited in between was sealed as
     "the snippet that was tested" when it was not (F-070). The manifest pin was
     written and never read; it is read now. */
  const snippetNow = sha16(read(SNIPPET));
  if (manifest.snippet_sha256 !== snippetNow) {
    process.stderr.write(
      `e6: templates/AGENTS.dsk.md changed after setup built these trees\n` +
        `    (setup ${manifest.snippet_sha256}, now ${snippetNow}).\n` +
        `    The trees carry the old snippet and the results file would seal the new one.\n` +
        `    Re-run \`node evals/scenarios/e6.mjs setup\` and redo the trials.\n`,
    );
    process.exit(2);
  }
  /* Hole 1: the id comes from the manifest, so a directory this setup did not
     build is refused rather than graded as `S?` with no scenario checks. */
  const results = dirs.map((d) => {
    const dir = resolve(d);
    const trial = manifest.trials.find((t) => resolve(t.dir) === dir);
    if (trial === undefined) {
      process.stderr.write(`e6: ${dir} was not built by setup; refusing to grade it.\n`);
      process.exit(2);
    }
    return grade({ ...trial, dir });
  });
  for (const r of results) {
    process.stdout.write(`${r.pass ? "PASS" : "FAIL"}  ${r.id}  ${r.dir}\n`);
    for (const c of r.checks) process.stdout.write(`        ${c.ok ? "ok  " : "FAIL"} ${c.name} — ${c.detail}\n`);
  }
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        generated: new Date().toISOString().slice(0, 10),
        runtime,
        fixture: manifest.fixture,
        snippet_sha256: sha16(read(SNIPPET)),
        validator_sha256: validatorHash(),
        results,
      },
      null,
      2,
    ) + "\n",
  );
  process.stdout.write(`\nwritten to evals/scenarios/e6-results.json — commit it, the runner grades it\n`);
  process.exit(results.every((r) => r.pass) ? 0 : 1);
} else {
  process.stderr.write('usage: e6.mjs setup | e6.mjs grade --runtime "<name>" <dir>...\n');
  process.exit(2);
}
