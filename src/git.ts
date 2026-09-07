/**
 * Git-level append-only check (D-012): shell out to the git binary, no library.
 *
 * The rule after D-021 clause 3.5 is as simple as it sounds: the committed
 * content of a ledger file must be a prefix of its new content. Any other
 * outcome — a changed line, a removed line, a deleted file — is a violation.
 * There is no whitelist and no sanctioned mutation, which is exactly what made
 * the old `superseded-by:` transition impossible to express (F-016).
 *
 * The check runs only when the validated directory is itself the root of a git
 * repository with a parent commit. That guard matters: fixture trees such as
 * `evals/fixtures/valid/VAL-01` live *inside* this repository, and without it
 * every fixture run would silently diff this repo's own history instead
 * (F-029 records the preamble question this same check raises).
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { LEDGERS } from "./load.js";
import type { AppendViolation } from "./types.js";

function git(root: string, ...args: string[]) {
  return spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
}

/** 1-based line, in HEAD's numbering, where `base` stops matching `head`. */
export function firstDivergentLine(base: string, head: string): number {
  const b = base.split("\n");
  const h = head.split("\n");
  for (let i = 0; i < b.length; i++) {
    if (i >= h.length) return Math.max(1, h.length);
    if (b[i] !== h[i]) return i + 1;
  }
  return Math.max(1, h.length);
}

/**
 * Returns the ledger files whose parent-commit content is not a prefix of their
 * HEAD content, or null when the check does not apply to this directory.
 */
export function appendViolations(root: string): AppendViolation[] | null {
  const top = git(root, "rev-parse", "--show-toplevel");
  if (top.status !== 0) return null;
  if (resolve(top.stdout.trim()) !== resolve(root)) return null;
  if (git(root, "rev-parse", "--verify", "-q", "HEAD~1").status !== 0) return null;

  const found: AppendViolation[] = [];
  for (const ledger of LEDGERS) {
    const base = git(root, "show", `HEAD~1:${ledger.file}`);
    const head = git(root, "show", `HEAD:${ledger.file}`);
    // Absent on either side reads as empty: a ledger added in HEAD is an
    // append from nothing, and one deleted in HEAD fails the prefix test.
    const b = base.status === 0 ? base.stdout : "";
    const h = head.status === 0 ? head.stdout : "";
    if (h.startsWith(b)) continue;
    found.push({ file: ledger.file, line: firstDivergentLine(b, h) });
  }
  return found;
}
