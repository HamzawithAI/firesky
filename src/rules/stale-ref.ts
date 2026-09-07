/**
 * ERR_STALE_REF — R19, redefined by M0-REVIEW 3.2.
 *
 * It governs `links` and `scope` members only, never `supersedes`. A decision
 * naming its predecessor is the mechanism, not a violation; without that
 * exemption no supersede chain could ever validate (F-015). Superseded-ness is
 * derived from later entries' pointers (D-021), never read off the superseded
 * entry. Fixture: INV-04. Whole-tree pass: VAL-02.
 */
import { idMembers, supersededDecisions } from "./helpers.js";
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_STALE_REF",
  run(tree) {
    const superseded = supersededDecisions(tree);
    if (superseded.size === 0) return [];
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      for (const key of ["links", "scope"] as const) {
        for (const member of idMembers(entry, key)) {
          if (!superseded.has(member)) continue;
          errors.push({
            code: "ERR_STALE_REF",
            file: entry.file,
            id: entry.id,
            line: entry.headingLine,
            message: `${key} names ${member}, which a later decision supersedes`,
          });
        }
      }
    }
    return errors;
  },
};
