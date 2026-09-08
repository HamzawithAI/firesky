/**
 * ERR_MODEL_ID — P3 and R25: an agent-authored entry records the exact model
 * identifier. Fixtures: INV-07 (decision), INV-17 (flag).
 *
 * Two conditions narrow it, both transcribed rather than invented.
 *
 * 1. SCHEMA.md section 2: the code "cannot fire on an entry that already has no
 *    provenance block". The implementation used to check only the author half
 *    of that definition, so a dateless agent entry drew this code as well as
 *    ERR_PROVENANCE, against the sentence's plain words (F-035). The predicate
 *    is now shared with the ERR_PROVENANCE module so the two cannot drift.
 *
 * 2. D-024, the dated grandfather rule ruled by M1-REVIEW.md section 2.2: on
 *    FLAG entries the requirement applies only from MODEL_FIELD_SINCE. The
 *    twenty flags F-005 to F-024 were lawfully written before M0-REVIEW 4.4
 *    added the field, D-021 forbids editing them, and there is no other legal
 *    in-schema fix (F-030). The rule is deliberately flag-only: that is the
 *    scope the ruling states, and the grounds it gives — entries written before
 *    the field existed — hold for no decision in any ledger.
 *
 * Known limit, accepted for v0.1 by D-024: a backdated flag dodges the rule.
 * The git record makes that visible without the validator enforcing it.
 */
import { field, ISO_DATE_RE, provenanceOf, unset } from "./helpers.js";
import type { DskError, Entry, Rule } from "../types.js";

/** SCHEMA.md section 2. The `model:` field did not exist on flags before this. */
export const MODEL_FIELD_SINCE = "2026-09-08";

/**
 * True when D-024 grandfathers this entry out of the rule. ISO dates sort
 * lexicographically, so the comparison needs no date arithmetic and no clock.
 * A flag whose date is absent or non-ISO is not "dated MODEL_FIELD_SINCE or
 * later" and is grandfathered; it is already red under ERR_PROVENANCE or
 * ERR_DATE, so nothing green is reachable through that door.
 */
function grandfathered(entry: Entry): boolean {
  if (entry.kind !== "flag") return false;
  const date = field(entry, "date");
  if (date === undefined || !ISO_DATE_RE.test(date)) return true;
  return date < MODEL_FIELD_SINCE;
}

export const rule: Rule = {
  code: "ERR_MODEL_ID",
  run(tree) {
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      const provenance = provenanceOf(entry);
      if (provenance.authorKey === null) continue; // criteria and sign-offs
      if (!provenance.present) continue; // condition 1
      if (provenance.author !== "agent") continue;
      if (grandfathered(entry)) continue; // condition 2
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
