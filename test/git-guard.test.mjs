/**
 * Regression test for the git-level check's applicability guard.
 *
 * EVALS.md section 1.3: every bug becomes a fixture before its fix is written.
 * This defect is not expressible as an INV state tree — the tree is identical
 * either way, and only the spelling of the path passed to the validator
 * differs — so it lands here rather than in the E1 inventory, which
 * M0-REVIEW.md section 5 freezes at INV-01 to INV-17 (F-032).
 *
 * The bug: `git rev-parse --show-toplevel` always prints the canonical path,
 * while node's `path.resolve` does not follow symlinks. Comparing the two
 * made the guard misfire on any path with a symlinked component, so the
 * tamper check silently did not run and a rewritten ledger validated green.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { appendViolations } from "../dist/git.js";

const LEDGER = "### D-001: A decision\nstatus: locked\ndate: 2026-09-01\n";

function buildTamperedRepo(dir) {
  const git = (...a) => spawnSync("git", ["-C", dir, ...a], { encoding: "utf8" });
  mkdirSync(join(dir, "state"), { recursive: true });
  const write = (body) => {
    writeFileSync(join(dir, "state", "decisions.md"), body);
    for (const f of ["flags.md", "criteria.md", "signoffs.md"]) writeFileSync(join(dir, "state", f), "# x\n");
    writeFileSync(join(dir, "state", "state.yaml"), 'schema: "0.1"\n');
  };
  git("init", "-q");
  git("config", "user.email", "evals@dsk.local");
  git("config", "user.name", "dsk evals");
  write(`# Decisions\n\n${LEDGER}`);
  git("add", "-A");
  git("commit", "-q", "-m", "base");
  // Rewrite a line that is already committed. This is the violation.
  write(`# Decisions\n\n${LEDGER.replace("A decision", "A rewritten decision")}`);
  git("add", "-A");
  git("commit", "-q", "-m", "head");
}

test("the tamper check fires through a symlinked path, not just the canonical one", () => {
  const base = mkdtempSync(join(tmpdir(), "dsk-guard-"));
  try {
    const real = join(base, "real");
    const link = join(base, "link");
    mkdirSync(real);
    buildTamperedRepo(real);
    symlinkSync(real, link);

    const viaReal = appendViolations(real);
    const viaLink = appendViolations(link);

    assert.deepEqual(viaReal, [{ file: "state/decisions.md", line: 3 }],
      "canonical path must report the in-place edit");
    // Before the fix this was null: the guard compared an uncanonicalised
    // resolve() against git's realpath, decided the target was not a repo
    // root, and skipped the check entirely — a silent false negative.
    assert.deepEqual(viaLink, viaReal,
      "a symlinked spelling of the same directory must reach the same verdict");
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test("a directory that is not a repo root still yields null (the guard's real job)", () => {
  const base = mkdtempSync(join(tmpdir(), "dsk-guard-nested-"));
  try {
    buildTamperedRepo(base);
    const nested = join(base, "state");
    // Inside the repo but not its root: must not diff the enclosing history.
    assert.equal(appendViolations(nested), null);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

/**
 * Regression for F-037: the prefix test must be line-aware.
 *
 * `h.startsWith(b)` is a BYTE prefix. When the parent blob has no trailing
 * newline its final line is a proper byte prefix of any longer line, so the
 * last committed line could be rewritten in place and the check passed. That
 * defeats law 5 and D12 in the one check that enforces them. Reproduced end to
 * end before the fix: a ledger ending `owner: hamza` with no newline, extended
 * to `owner: hamza-NO-WAIT-mallory`, validated green with exit 0.
 */
import { isAppendOf } from "../dist/git.js";

test("a partial final line is not an append, however the blob ends (F-037)", () => {
  // The attack: the parent blob's last line has no terminator.
  assert.equal(isAppendOf("a\nowner: hamza", "a\nowner: hamza-NO-WAIT-mallory\n"), false);
  // A real append after an unterminated final line stays legal.
  assert.equal(isAppendOf("a\nowner: hamza", "a\nowner: hamza\nb: c\n"), true);
  // Terminating the final line without changing its content is legal.
  assert.equal(isAppendOf("a\nowner: hamza", "a\nowner: hamza\n"), true);
  // No change at all is legal.
  assert.equal(isAppendOf("a\nowner: hamza", "a\nowner: hamza"), true);
  // The ordinary terminated cases are unchanged.
  assert.equal(isAppendOf("a\nb\n", "a\nb\nc\n"), true);
  assert.equal(isAppendOf("a\nb\n", "a\nB\nc\n"), false);
  assert.equal(isAppendOf("a\nb\n", "a\n"), false);
  // A ledger added in HEAD is an append from nothing.
  assert.equal(isAppendOf("", "a\nb\n"), true);
});
