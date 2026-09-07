/**
 * ERR_DATE — SCHEMA.md section 3. Present but not ISO `YYYY-MM-DD`. An absent
 * date is ERR_PROVENANCE instead, which is the split M0-REVIEW 4.5 drew to keep
 * the two codes from firing on one entry. Fixture: INV-13.
 */
import { field, ISO_DATE_RE } from "./helpers.js";
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_DATE",
  run(tree) {
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      const date = field(entry, "date");
      if (date === undefined || ISO_DATE_RE.test(date)) continue;
      errors.push({
        code: "ERR_DATE",
        file: entry.file,
        id: entry.id,
        line: entry.headingLine,
        message: `date '${date}' is not ISO YYYY-MM-DD`,
      });
    }
    return errors;
  },
};
