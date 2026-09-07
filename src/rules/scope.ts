/**
 * ERR_SCOPE — the `scope` half of the split M0-REVIEW 4.3 drew, closing F-007.
 * Same resolution rule as ERR_LINK, different field. Fixture: INV-16.
 */
import { allIds, idMembers } from "./helpers.js";
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_SCOPE",
  run(tree) {
    const known = allIds(tree);
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      for (const member of idMembers(entry, "scope")) {
        if (known.has(member)) continue;
        errors.push({
          code: "ERR_SCOPE",
          file: entry.file,
          id: entry.id,
          line: entry.headingLine,
          message: `scope member ${member} does not resolve within state/`,
        });
      }
    }
    return errors;
  },
};
