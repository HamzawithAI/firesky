/**
 * The validator (R18 schema validation, R19 referential integrity).
 *
 * Deterministic before generative (law 2, P2): zero network, zero LLM calls,
 * zero clock reads. The same tree always produces the same JSON, which is what
 * lets E2 compare against expected outputs written before this code existed.
 */
import { appendViolations } from "./git.js";
import { loadTree } from "./load.js";
import { RULES } from "./rules/index.js";
import type { DskError, ValidateResult } from "./types.js";

/** Errors are compared as a set (F-008), so identity is code+file+id+line. */
function dedupe(errors: readonly DskError[]): DskError[] {
  const seen = new Set<string>();
  const out: DskError[] = [];
  for (const error of errors) {
    const key = `${error.code}|${error.file}|${error.id ?? ""}|${error.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(error);
  }
  return out;
}

/** Stable ordering so output diffs are readable. Order is not asserted by E2. */
function byPosition(a: DskError, b: DskError): number {
  return a.file.localeCompare(b.file) || a.line - b.line || a.code.localeCompare(b.code);
}

export function validate(root: string): ValidateResult {
  const tree = loadTree(root, appendViolations(root));
  const errors = dedupe(RULES.flatMap((rule) => rule.run(tree))).sort(byPosition);
  return { ok: errors.length === 0, errors, counts: tree.counts };
}
