/**
 * E7, the install path (EVALS.md section 8, AC3): "scripted fresh-environment
 * run, npx init to first validated decision entry, wall-clock under 10 minutes."
 *
 * THE ONE IDEA HERE. E7 does not contain a copy of the install path. It reads
 * the README's own ten-minute section, extracts the shell blocks a new user
 * would run, and runs exactly those in a fresh directory. So the README cannot
 * drift from the thing that is graded: if the documented path stops working, or
 * someone edits a step, this suite goes red. That is the F-045 discipline — the
 * spec document is the source, never a list hand-copied into the harness —
 * pointed at the one document that has been wrong for four milestones (F-072).
 *
 * WHAT "FRESH ENVIRONMENT" MEANS HERE, AND WHAT IT DOES NOT.
 *   - Fresh: a temporary directory outside the repository, no node_modules, no
 *     state/, no dsk on PATH. The package is installed from a tarball built by
 *     `npm pack` at the moment of the run, so what is graded is what would ship.
 *   - Not fresh: the machine. The Node runtime, npm and npm's cache are the
 *     ones already here. A truly cold machine is not something this suite can
 *     honestly simulate, and pretending otherwise would be the kind of green
 *     that costs more than a red.
 *   - One substitution, and only one: the README installs the package by NAME,
 *     which is correct for a reader and impossible here because v0.1 is not
 *     published yet. E7 rewrites that one token to the local tarball path and
 *     reports that it did. The registry round trip is therefore NOT part of the
 *     measured time; F-076 carries that gap until the package is published.
 *
 * The clock covers everything a new user does: pack, install, create the
 * ledgers, write the first decision, validate it. AC3's bar is ten minutes.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const BAR_SECONDS = 600;
const PACKAGE_NAME = "decision-state-kit";
const REQUIRED_STATE_FILES = ["decisions.md", "flags.md", "criteria.md", "signoffs.md", "state.yaml"];

/**
 * The README's ten-minute path, as blocks of shell. Returns null when the
 * section is absent, which is how this suite was red before M4 wrote it.
 */
export function pathFromReadme(readme) {
  const start = readme.indexOf("## The ten-minute path");
  if (start === -1) return null;
  const rest = readme.slice(start + 1);
  const end = rest.indexOf("\n## ");
  const section = end === -1 ? rest : rest.slice(0, end);
  const blocks = [...section.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]);
  return blocks.length === 0 ? null : blocks;
}

/** The single documented rewrite: install by name becomes install by tarball. */
export function substituteTarball(script, tarball) {
  return script.replace(
    new RegExp(`(npm\\s+install\\s+[^\\n]*?)${PACKAGE_NAME}(@[\\w.\\-]+)?`, "g"),
    (_m, head) => `${head}${tarball}`,
  );
}

export function gradeE7({ ROOT }) {
  const id = "E7";
  const kind = "install";
  const readmePath = join(ROOT, "README.md");
  if (!existsSync(readmePath))
    return [{ id, kind, status: "FAIL", detail: "README.md is absent, so there is no documented install path to time" }];

  const blocks = pathFromReadme(readFileSync(readmePath, "utf8"));
  if (blocks === null)
    return [{
      id, kind, status: "FAIL",
      detail: "README.md has no `## The ten-minute path` section with a bash block; AC3 is a claim about a path a reader can follow, so the README is the specification and it is missing",
    }];

  const script = blocks.join("\n");
  if (!/\bdsk\s+validate\b/.test(script))
    return [{ id, kind, status: "FAIL", detail: "the documented path never runs `dsk validate`, so it does not reach a validated entry" }];

  const started = Date.now();
  const sandbox = mkdtempSync(join(tmpdir(), "dsk-e7-"));
  try {
    /* 1. Pack what would ship. Not `npm publish`, and not the working tree: the
       tarball honours package.json `files`, so a path that depends on something
       the package does not ship fails here rather than in a user's terminal. */
    const packed = spawnSync("npm", ["pack", "--silent", "--pack-destination", sandbox], {
      cwd: ROOT, encoding: "utf8", timeout: 120_000,
    });
    if (packed.status !== 0)
      return [{ id, kind, status: "FAIL", detail: `npm pack failed: ${(packed.stderr || "").trim().slice(0, 200)}` }];
    const tgz = readdirSync(sandbox).find((f) => f.endsWith(".tgz"));
    if (tgz === undefined)
      return [{ id, kind, status: "FAIL", detail: "npm pack produced no tarball" }];

    /* 2. A fresh project directory, and the README's own steps inside it. */
    const project = join(sandbox, "fresh");
    mkdirSync(project);
    const runner = join(sandbox, "ten-minute-path.sh");
    writeFileSync(runner, `set -euo pipefail\n${substituteTarball(script, join(sandbox, tgz))}\n`);
    const run = spawnSync("bash", [runner], {
      cwd: project, encoding: "utf8", timeout: BAR_SECONDS * 1000,
      env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false", npm_config_prefer_offline: "true" },
    });
    const elapsed = (Date.now() - started) / 1000;

    if (run.status !== 0)
      return [{
        id, kind, status: "FAIL",
        detail: `the documented path exited ${run.status} after ${elapsed.toFixed(1)}s: ${(run.stderr || run.stdout || "").trim().split("\n").slice(-3).join(" / ").slice(0, 300)}`,
      }];

    /* 3. What the path had to have produced, checked here rather than trusted
       from the block's own exit code: the four ledgers plus state.yaml, at
       least one decision entry, and a tree the SHIPPED validator calls valid.
       The last check runs the repository's own build, not the block's, so a
       path that printed success without validating anything is caught. */
    const problems = [];
    const stateDir = join(project, "state");
    for (const f of REQUIRED_STATE_FILES)
      if (!existsSync(join(stateDir, f))) problems.push(`state/${f} was never created`);
    if (existsSync(join(stateDir, "decisions.md"))) {
      const decisions = readFileSync(join(stateDir, "decisions.md"), "utf8");
      const ids = [...decisions.matchAll(/^### (D-\d{3})/gm)].map((m) => m[1]);
      if (ids.length === 0) problems.push("no decision entry was written, so 'first validated decision entry' was not reached");
    }
    const independent = spawnSync(process.execPath, [join(ROOT, "dist", "cli.js"), "validate", "--json", project], { encoding: "utf8" });
    if (independent.status !== 0)
      problems.push(`the shipped validator rejects what the path produced (exit ${independent.status})`);

    if (problems.length > 0)
      return [{ id, kind, status: "FAIL", detail: `${problems.join("; ")} — ${elapsed.toFixed(1)}s` }];

    if (elapsed > BAR_SECONDS)
      return [{ id, kind, status: "FAIL", detail: `${elapsed.toFixed(1)}s, over AC3's ${BAR_SECONDS}s bar` }];

    return [{
      id, kind, status: "PASS",
      detail: `${elapsed.toFixed(1)}s of AC3's ${BAR_SECONDS}s, ${blocks.length} README block(s), pack to validated first decision, registry step substituted (F-076)`,
    }];
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
}
