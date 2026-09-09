/**
 * E8, degraded mode (EVALS.md section 8, AC4, R26): "full validator suite
 * executed with no network and no API keys present."
 *
 * Three legs, and each one is reported separately because they prove different
 * things and a single green row would hide which of them carried the claim.
 *
 *   E8-static    Nothing in the shipped source can reach the network. Read
 *                statically, so it holds for code paths no fixture exercises.
 *   E8-fixtures  Every fixture in the frozen inventory is re-run through the
 *                CLI in a child that has no credentials in scope and cannot
 *                load a networking builtin, and is compared against its own
 *                expected file by the SAME predicate E1 and E2 use. Passing E1
 *                and failing here would mean the validator is quietly
 *                network-dependent; the two suites must agree exactly.
 *   E8-surface   R26 says "every M-priority function", not "validate". So
 *                status, staleness and render run under the same conditions.
 *
 * ON RED-BEFORE-GREEN (D7). This suite is not red-then-green and saying so
 * matters. The property it grades was built at M1 and M2; E8 is the first thing
 * that checks it. That is the F-048 precedent — INV-18 entered the frozen
 * inventory already green — and the honest description is "a claim that was
 * never verified, now verified", not "a feature built to a failing test". What
 * WAS red first is the runner row: E8 did not exist, so the suite reported it
 * FAIL before this file was written.
 *
 * Zero cost, no network, no model. It is safe to run on every CI push and does.
 */
import { readFileSync, readdirSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const PRELOAD = "./evals/degraded/no-network.mjs";

/** Builtins that can open a socket, in every spelling a module can name them. */
const NET_BUILTINS = ["net", "tls", "http", "https", "http2", "dgram", "dns", "inspector"];
/** git subcommands that talk to a remote. `src/git.ts` must name none of them. */
const NET_GIT = ["fetch", "pull", "push", "clone", "ls-remote", "remote", "submodule"];

const walkTs = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walkTs(join(dir, e.name)) : e.name.endsWith(".ts") ? [join(dir, e.name)] : []);

/**
 * The environment a degraded-mode run gets: no credentials, no proxy, nothing
 * that could quietly provide a route out. Built by allow-list rather than by
 * deletion, because a deny-list of key names is a guess about the future and an
 * allow-list is a statement about what the validator needs, which is almost
 * nothing.
 */
export function degradedEnv(execPath) {
  return {
    /* PATH is inherited, and that is deliberate. Degraded mode means no model
       and no network (R26, AC4); it does not mean no git. D-012 implements the
       append-only rules by shelling out to git, and the first version of this
       file stripped PATH down to Node's own directory — which made git
       unreachable, which made ERR_INPLACE_EDIT and ERR_SIGNOFF_MUTATION report
       nothing on the three git fixtures while `validate` still exited 0. E8
       caught it, and the check below keeps it caught: a degraded run with no
       git is a FAILED run here, never a quiet pass on a validator missing two
       of its sixteen rules. The behaviour itself is F-077. */
    PATH: process.env.PATH ?? join(execPath, ".."),
    HOME: process.env.HOME ?? "/tmp",
    /* Deliberately present: it pins the clock so staleness is deterministic. */
    ...(process.env.DSK_NOW ? { DSK_NOW: process.env.DSK_NOW } : {}),
  };
}

function runDegraded(execPath, args, cwd) {
  return spawnSync(execPath, ["--import", PRELOAD, ...args], {
    encoding: "utf8",
    cwd,
    env: degradedEnv(execPath),
  });
}

/* --------------------------------------------------------------- E8-static */

function staticLeg(ROOT) {
  const problems = [];
  const srcDir = join(ROOT, "src");
  if (!existsSync(srcDir)) return { problems: ["src/ is missing from the tree"], files: 0 };
  const files = walkTs(srcDir).sort();

  for (const f of files) {
    const text = readFileSync(f, "utf8");
    const where = f.slice(ROOT.length + 1);
    /* Imports, static and dynamic, in both spellings. */
    for (const b of NET_BUILTINS) {
      const re = new RegExp(`(from\\s+|import\\s*\\(\\s*|require\\s*\\(\\s*)["'](node:)?${b}(/[a-z]+)?["']`);
      if (re.test(text)) problems.push(`${where} imports ${b}`);
    }
    if (/\bfetch\s*\(/.test(text)) problems.push(`${where} calls fetch()`);
    if (/\bXMLHttpRequest\b/.test(text)) problems.push(`${where} names XMLHttpRequest`);
    /* D-012 shells out to git. Read-only, local subcommands only. */
    for (const sub of NET_GIT) {
      const re = new RegExp(`["']${sub}["']`);
      if (re.test(text) && /child_process|spawnSync|execFile/.test(text)) problems.push(`${where} may run \`git ${sub}\`, which talks to a remote`);
    }
  }

  /* The dependency surface, which is where a network capability would arrive
     without anyone editing src/. CLAUDE.md rule 4 allows argument parsing and
     yaml; D-014 clause 5 forbids adding to that without a decision. */
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const deps = Object.keys(pkg.dependencies ?? {});
  const allowed = new Set(["yaml"]);
  for (const d of deps) if (!allowed.has(d)) problems.push(`runtime dependency '${d}' is outside the allowed baseline (D-014 clause 5)`);

  /* And the dependency's own reach, read the same way the source was. A shipped
     dependency that imports node:net would make the static leg above vacuous. */
  for (const d of deps) {
    const dir = join(ROOT, "node_modules", d);
    if (!existsSync(dir)) { problems.push(`dependency '${d}' is not installed, so its reach could not be read`); continue; }
    const stack = [dir];
    let scanned = 0;
    while (stack.length > 0 && scanned < 400) {
      const cur = stack.pop();
      for (const e of readdirSync(cur, { withFileTypes: true })) {
        const p = join(cur, e.name);
        if (e.isDirectory()) { if (e.name !== "node_modules") stack.push(p); continue; }
        if (!/\.(m?js|cjs)$/.test(e.name)) continue;
        if (statSync(p).size > 2_000_000) continue;
        scanned++;
        const text = readFileSync(p, "utf8");
        for (const b of NET_BUILTINS) {
          const re = new RegExp(`(from\\s*|require\\s*\\(\\s*)["'](node:)?${b}["']`);
          if (re.test(text)) problems.push(`dependency '${d}' reaches ${b} in ${p.slice(ROOT.length + 1)}`);
        }
      }
    }
  }

  return { problems, files: files.length, deps };
}

/* ------------------------------------------------------------ E8 entry point */

/**
 * @param opts.ROOT       repository root
 * @param opts.CLI        path to dist/cli.js
 * @param opts.fixtures   [{ id, kind, target }] already materialised by the runner
 * @param opts.compare    the runner's own E2 predicate, reused rather than copied
 */
export function gradeE8({ ROOT, CLI, fixtures, compare }) {
  const kind = "degraded";
  const rows = [];
  const execPath = process.execPath;

  const s = staticLeg(ROOT);
  rows.push(
    s.problems.length === 0
      ? { id: "E8-static", kind, status: "PASS", detail: `${s.files} source files and ${(s.deps ?? []).length} runtime dependency reach no networking builtin` }
      : { id: "E8-static", kind, status: "FAIL", detail: s.problems.join("; ") },
  );

  if (!existsSync(CLI)) {
    rows.push({ id: "E8-fixtures", kind, status: "FAIL", detail: "dist/cli.js is absent" });
    rows.push({ id: "E8-surface", kind, status: "FAIL", detail: "dist/cli.js is absent" });
    return rows;
  }

  /* Leg 2: the frozen inventory, degraded, against the same expected files.

     First, the precondition, asserted rather than assumed: git must be
     reachable in exactly the environment the fixtures are about to run in. Two
     of the sixteen error codes are git-level, and a validator that cannot find
     git reports neither and still exits 0. An eval that grades a silently
     reduced validator is worse than no eval (F-031's lesson, F-077's case). */
  const gitProbe = spawnSync("git", ["--version"], { encoding: "utf8", env: degradedEnv(execPath) });
  if (gitProbe.status !== 0) {
    rows.push({
      id: "E8-fixtures", kind, status: "FAIL",
      detail: "git is not reachable in the degraded environment, so the two git-level rules would report nothing while validate still exited 0",
    });
    rows.push({ id: "E8-surface", kind, status: "FAIL", detail: "not run: git is unreachable in the degraded environment" });
    return rows;
  }

  const failures = [];
  for (const f of fixtures) {
    const r = runDegraded(execPath, [CLI, "validate", "--json", f.target], ROOT);
    if (r.status === 97) { failures.push(`${f.id}: ${r.stderr.trim()}`); continue; }
    let actual;
    try {
      actual = JSON.parse(r.stdout);
    } catch {
      failures.push(`${f.id}: no JSON on stdout (${(r.stderr || r.stdout).trim().slice(0, 100)})`);
      continue;
    }
    const problems = compare(f.id, f.kind, actual, r.status);
    if (problems.length > 0) failures.push(`${f.id}: ${problems.join(", ")}`);
  }
  rows.push(
    failures.length === 0
      ? { id: "E8-fixtures", kind, status: "PASS", detail: `${fixtures.length} fixtures match their expected output with no network and no credentials in scope` }
      : { id: "E8-fixtures", kind, status: "FAIL", detail: failures.slice(0, 4).join("; ") },
  );

  /* Leg 3: R26's "every M-priority function", not just validate. */
  const val01 = join(ROOT, "evals", "fixtures", "valid", "VAL-01");
  mkdirSync(join(ROOT, "evals", ".work"), { recursive: true });
  const surface = [
    { name: "status", args: [CLI, "status", "--json", val01], want: 0 },
    { name: "staleness", args: [CLI, "staleness", "--json", "--window", "30", val01], want: 0 },
    { name: "render", args: [CLI, "render", val01, "--out", join(ROOT, "evals", ".work", "e8-render.html")], want: 0 },
    { name: "validate", args: [CLI, "validate", "--json", val01], want: 0 },
  ];
  const broken = [];
  for (const c of surface) {
    const r = runDegraded(execPath, c.args, ROOT);
    if (r.status !== c.want) broken.push(`${c.name} exited ${r.status}: ${(r.stderr || "").trim().slice(0, 120)}`);
  }
  rows.push(
    broken.length === 0
      ? { id: "E8-surface", kind, status: "PASS", detail: `validate, status, staleness and render all run degraded (R26)` }
      : { id: "E8-surface", kind, status: "FAIL", detail: broken.join("; ") },
  );

  return rows;
}
