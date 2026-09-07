/**
 * ERR_DUP_ID — SCHEMA.md section 3: ids are permanent and never reused.
 * Reported on the reuse, not on the original. Fixture: INV-02.
 */
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_DUP_ID",
  run(tree) {
    const errors: DskError[] = [];
    const seen = new Set<string>();
    for (const entry of tree.entries) {
      if (seen.has(entry.id)) {
        errors.push({
          code: "ERR_DUP_ID",
          file: entry.file,
          id: entry.id,
          line: entry.headingLine,
          message: `identifier ${entry.id} is already used`,
        });
        continue;
      }
      seen.add(entry.id);
    }
    return errors;
  },
};
