/**
 * Trial replay, extracted from the runner (M3-REVIEW-2.md section 3.1).
 *
 * WHY THIS FILE EXISTS SEPARATELY. D-032 section 4.3 makes the runner re-derive
 * every E5 pass count by seeding a fresh trial tree, applying that trial's
 * committed diff, and running the same graders the harness ran. Section 3.1 of
 * the second review then authorised a re-grade of an existing run's thirty-five
 * artifacts under an amended validator, as its own step, with zero new trials —
 * which needs exactly the same replay from a second caller.
 *
 * Two copies of a replay would drift, and a drifted replay does not compare
 * anything: the runner would grade one reconstruction and the audit another. So
 * there is one copy, here, imported by `evals/runner.mjs` and by
 * `evals/scenarios/regrade.mjs`. This is the same reasoning that put the graders
 * in `graders.mjs` rather than inside the harness.
 *
 * Nothing here reads the network or invokes a model. The oracle is the shipped
 * validator plus the graders, as EVALS.md section 1.2 requires.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gradeTrial, observe, readLedgers, seedTrial } from "./graders.mjs";

export const sha16 = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);

/**
 * One trial, re-graded from its committed artifacts (D-032 section 4.3).
 *
 * Seed a trial tree exactly as the harness does, apply the committed diff, run
 * the same graders. The verdict this produces is the one that counts; the
 * recorded `pass` is compared against it and reported, never used as the answer.
 *
 * `problems` is the audit trail: a missing artifact, an artifact whose sha-256
 * no longer matches what the run recorded, a diff that will not apply to a fresh
 * seed, or a disagreement between the recorded verdict and the re-derived one.
 */
export function regradeTrial(root, cli, gate, trial) {
  const problems = [];
  const bodies = {};
  for (const kind of ["raw", "output", "diff"]) {
    const meta = trial.artifacts?.[kind];
    if (meta === undefined) { problems.push(`trial ${trial.trial}: no ${kind} artifact recorded`); continue; }
    const p = join(root, meta.path);
    if (!existsSync(p)) { problems.push(`trial ${trial.trial}: ${meta.path} is missing`); continue; }
    const body = readFileSync(p, "utf8");
    if (sha16(body) !== meta.sha256) problems.push(`trial ${trial.trial}: ${meta.path} changed since the run`);
    bodies[kind] = body;
  }
  if (problems.length > 0) return { pass: false, problems };

  const dir = seedTrial(root, gate.fixture, mkdtempSync(join(tmpdir(), "dsk-regrade-")));
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
    const graded = gradeTrial(gate, observe(dir, before, cli), text, cliError, "recorded CLI error");
    if (graded.pass !== trial.pass)
      problems.push(`trial ${trial.trial}: recorded pass=${trial.pass}, re-derived ${graded.pass}`);
    return { pass: graded.pass, problems, checks: graded.checks };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
