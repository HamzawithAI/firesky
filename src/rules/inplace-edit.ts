/**
 * ERR_INPLACE_EDIT — law 5 and R10, enforced at the git level (D12).
 *
 * After D-021 clause 3.5 there is no whitelist: any change to a committed
 * ledger line is a violation, including a status line. That is what made S3's
 * hard 5-of-5 gate satisfiable by pure appends. Owns the three ledgers that
 * ERR_SIGNOFF_MUTATION does not. Fixtures: INV-14 (fails), VAL-05 (passes).
 */
import { entryAtLine } from "./helpers.js";
import { SIGNOFF_LEDGER } from "./signoff-mutation.js";
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_INPLACE_EDIT",
  run(tree) {
    if (tree.appendViolations === null) return [];
    const errors: DskError[] = [];
    for (const violation of tree.appendViolations) {
      if (violation.file === SIGNOFF_LEDGER) continue;
      const entry = entryAtLine(tree, violation.file, violation.line);
      errors.push({
        code: "ERR_INPLACE_EDIT",
        file: violation.file,
        id: entry?.id ?? null,
        line: entry?.headingLine ?? violation.line,
        message: entry
          ? `${entry.id} was edited in place instead of superseded by an appended entry`
          : `${violation.file} was modified above its first entry`,
      });
    }
    return errors;
  },
};
