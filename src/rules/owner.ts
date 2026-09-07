/**
 * ERR_OWNER — SCHEMA.md section 2. Decisions and flags carry an owner; an
 * unowned entry looks like tracked state and is nobody's job (S4's rationale).
 * Fixtures: INV-01 (decision), INV-09 (flag).
 */
import { field } from "./helpers.js";
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_OWNER",
  run(tree) {
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      if (entry.kind !== "decision" && entry.kind !== "flag") continue;
      const owner = field(entry, "owner");
      if (owner !== undefined && owner !== "") continue;
      errors.push({
        code: "ERR_OWNER",
        file: entry.file,
        id: entry.id,
        line: entry.headingLine,
        message: `${entry.kind} has no owner`,
      });
    }
    return errors;
  },
};
