/**
 * ERR_RESOLUTION — SCHEMA.md section 2: a resolved flag with `resolution: none`
 * claims a conclusion it does not record. Fixture: INV-10.
 */
import { field, unset } from "./helpers.js";
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_RESOLUTION",
  run(tree) {
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      if (entry.kind !== "flag" || field(entry, "status") !== "resolved") continue;
      if (!unset(field(entry, "resolution"))) continue;
      errors.push({
        code: "ERR_RESOLUTION",
        file: entry.file,
        id: entry.id,
        line: entry.headingLine,
        message: "resolved flag has no resolution note",
      });
    }
    return errors;
  },
};
