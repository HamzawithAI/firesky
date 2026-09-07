/**
 * ERR_SIGNOFF_MUTATION — SCHEMA.md section 2 and D12. Owns `state/signoffs.md`;
 * ERR_INPLACE_EDIT owns the other three ledgers, so exactly one code fires per
 * file (F-020). Fixture: INV-08, a two-commit fixture (D-016).
 */
import { entryAtLine } from "./helpers.js";
import type { DskError, Rule } from "../types.js";

export const SIGNOFF_LEDGER = "state/signoffs.md";

export const rule: Rule = {
  code: "ERR_SIGNOFF_MUTATION",
  run(tree) {
    if (tree.appendViolations === null) return [];
    const errors: DskError[] = [];
    for (const violation of tree.appendViolations) {
      if (violation.file !== SIGNOFF_LEDGER) continue;
      const entry = entryAtLine(tree, violation.file, violation.line);
      errors.push({
        code: "ERR_SIGNOFF_MUTATION",
        file: violation.file,
        id: entry?.id ?? null,
        line: entry?.headingLine ?? violation.line,
        message: entry
          ? `sign-off ${entry.id} was modified after it was appended`
          : "signoffs.md was modified above its first entry",
      });
    }
    return errors;
  },
};
