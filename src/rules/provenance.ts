/**
 * ERR_PROVENANCE — defined by M0-REVIEW 4.5, which closed F-019: `author`
 * missing or invalid, or `date` absent.
 *
 * F-027 narrows "on any entry" to the fields each entry type's grammar actually
 * defines. Read literally the rule would fire on every criterion and every
 * sign-off in every green fixture, since criteria carry neither field and
 * sign-offs carry no author. Fixture: INV-06.
 *
 * The predicate itself lives in helpers.ts, shared with ERR_MODEL_ID, which
 * SCHEMA.md section 2 conditions on it. Keeping one definition is the fix for
 * the class of defect F-035 recorded.
 */
import { provenanceOf } from "./helpers.js";
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_PROVENANCE",
  run(tree) {
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      const { authorKey, author, dateMissing, present } = provenanceOf(entry);
      if (present) continue;

      errors.push({
        code: "ERR_PROVENANCE",
        file: entry.file,
        id: entry.id,
        line: entry.headingLine,
        message: dateMissing
          ? "entry has no date"
          : author === undefined
            ? `entry has no ${authorKey}`
            : `${authorKey} '${author}' is neither human nor agent`,
      });
    }
    return errors;
  },
};
