/** ERR_ID_GRAMMAR — SCHEMA.md section 3. Fixture: INV-11. */
import { ID_RE } from "./helpers.js";
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_ID_GRAMMAR",
  run(tree) {
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      if (ID_RE.test(entry.id)) continue;
      errors.push({
        code: "ERR_ID_GRAMMAR",
        file: entry.file,
        id: entry.id,
        line: entry.headingLine,
        message: `identifier '${entry.id}' is not a prefix plus three zero-padded digits`,
      });
    }
    return errors;
  },
};
