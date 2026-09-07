/**
 * ERR_RATIONALE — SCHEMA.md section 2: five lines maximum. The limit is a
 * feature, not a formatting rule; it is what stops a decision entry becoming a
 * document. Fixtures: INV-15 (six lines), VAL-05 (exactly five, and green).
 */
import type { DskError, Rule } from "../types.js";

const MAX_RATIONALE_LINES = 5;

export const rule: Rule = {
  code: "ERR_RATIONALE",
  run(tree) {
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      if (entry.kind !== "decision" || entry.prose.length <= MAX_RATIONALE_LINES) continue;
      errors.push({
        code: "ERR_RATIONALE",
        file: entry.file,
        id: entry.id,
        line: entry.headingLine,
        message: `rationale is ${entry.prose.length} lines, limit is ${MAX_RATIONALE_LINES}`,
      });
    }
    return errors;
  },
};
