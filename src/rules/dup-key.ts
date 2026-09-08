/**
 * ERR_DUP_KEY — SCHEMA.md section 2, added by D-033 (M3-REVIEW.md section 5).
 *
 * An entry that carries the same key twice is malformed. The grammar is one
 * `key: value` line per key, and a line-oriented parser reading a repeated key
 * has to pick one; whichever it picks, the other occurrence is a rule silently
 * disabled. The concrete case F-052 recorded as a close call:
 *
 *     raised-by: agent
 *     raised-by: human
 *     model: none
 *
 * reads as human-raised under last-writer-wins, so ERR_MODEL_ID never fires and
 * a provenance claim the ledger cannot support validates green.
 *
 * Stated for every entry type and every key, because the defect is the
 * ambiguity and not any one field. One error per entry, listing the repeated
 * keys, anchored at the heading like every other code (F-008).
 *
 * Fixture: INV-19.
 */
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_DUP_KEY",
  run(tree) {
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      if (entry.duplicateKeys.length === 0) continue;
      const keys = [...new Set(entry.duplicateKeys.map((d) => d.key))];
      const where = entry.duplicateKeys.map((d) => `line ${d.line}`).join(", ");
      errors.push({
        code: "ERR_DUP_KEY",
        file: entry.file,
        id: entry.id,
        line: entry.headingLine,
        message: `${entry.kind} entry repeats the key ${keys.map((k) => `'${k}'`).join(", ")} (${where})`,
      });
    }
    return errors;
  },
};
