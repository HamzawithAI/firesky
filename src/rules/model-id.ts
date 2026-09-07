/**
 * ERR_MODEL_ID — P3 and R25: an agent-authored entry records the exact model
 * identifier. Conditioned on the author or raiser being `agent`, so it cannot
 * fire on an entry that already has no provenance block.
 *
 * M0-REVIEW 4.4 extended the rule to flags, which is what closed F-013 and
 * F-018. Fixtures: INV-07 (decision), INV-17 (flag).
 */
import { field, unset } from "./helpers.js";
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_MODEL_ID",
  run(tree) {
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      const key = entry.kind === "decision" ? "author" : entry.kind === "flag" ? "raised-by" : null;
      if (key === null) continue;
      if (field(entry, key) !== "agent") continue;
      if (!unset(field(entry, "model"))) continue;
      errors.push({
        code: "ERR_MODEL_ID",
        file: entry.file,
        id: entry.id,
        line: entry.headingLine,
        message: `agent-${entry.kind === "decision" ? "authored" : "raised"} ${entry.kind} has no model id`,
      });
    }
    return errors;
  },
};
