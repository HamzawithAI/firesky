/**
 * ERR_LINK — SCHEMA.md section 3, narrowed by M0-REVIEW 4.3 to the `links`
 * field alone; `scope` belongs to ERR_SCOPE. Only ID-shaped members are
 * checked, so `links: [PROJECT.md#3]` resolves nowhere and is fine.
 * Fixture: INV-05.
 */
import { allIds, idMembers } from "./helpers.js";
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_LINK",
  run(tree) {
    const known = allIds(tree);
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      for (const member of idMembers(entry, "links")) {
        if (known.has(member)) continue;
        errors.push({
          code: "ERR_LINK",
          file: entry.file,
          id: entry.id,
          line: entry.headingLine,
          message: `link target ${member} does not resolve within state/`,
        });
      }
    }
    return errors;
  },
};
