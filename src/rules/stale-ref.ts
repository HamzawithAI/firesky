/**
 * ERR_STALE_REF — R19, redefined by M0-REVIEW 3.2 and narrowed by the F-036
 * ruling in M2-REVIEW.md section 2.
 *
 * It never governed `supersedes`: a decision naming its predecessor is the
 * mechanism, not a violation, and without that exemption no supersede chain
 * could validate (F-015). Superseded-ness is derived from later entries'
 * pointers (D-021), never read off the superseded entry.
 *
 * F-036 then found that the M0 definition made supersession — the one legal
 * correction this schema has — permanently invalidate the tree. Firing on any
 * `links` or `scope` member of any entry meant that superseding a decision a
 * sign-off had scoped turned that sign-off red forever, and a sign-off can
 * neither be edited (D12, law 4) nor un-scoped, so no legal exit existed. The
 * ruling narrows the code to the one place a stale reference actually misleads,
 * in three parts:
 *
 *   2.1  Sign-off `scope` is exempt forever. A sign-off attests to an entry as
 *        it stood at that moment; a later supersession does not falsify that
 *        history. ERR_SCOPE still applies to sign-offs in full, so a scoped id
 *        that does not exist is still an error — the exemption is from
 *        staleness, not from existence.
 *   2.2  Criterion `scope` becomes a staleness-report warning instead, surfaced
 *        by `dsk status` and `render` (see staleScopeWarnings). The signal
 *        survives, the brick does not.
 *   2.3  `links` stays a hard error, but only on an entry that is itself
 *        current. F-036's second reproduction was that superseding the
 *        referring entry did not clear the error either, so the append-only
 *        remedy D-021 promises did not exist for this code. It does now: the
 *        legal fix for a stale `links` is to supersede the entry that carries
 *        it, which is a pure append.
 *
 * Fixture: INV-04, whose D-003 is current and links a superseded D-001, which
 * is exactly case 2.3 and needed no adjustment. Whole-tree pass: VAL-02. The
 * valid trees the ruling creates have no home in the frozen inventory and are
 * pinned in test/f036-ruling.test.mjs (F-049).
 */
import { idMembers, supersededBy, supersededDecisions } from "./helpers.js";
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_STALE_REF",
  run(tree) {
    const superseded = supersededDecisions(tree);
    if (superseded.size === 0) return [];
    const by = supersededBy(tree);
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      // 2.3: an entry that has itself been superseded is history, and history
      // is allowed to point at history.
      if (superseded.has(entry.id)) continue;
      // `scope` is gone from this rule entirely: exempt on sign-offs (2.1), a
      // warning on criteria (2.2). Only `links` remains.
      for (const member of idMembers(entry, "links")) {
        if (!superseded.has(member)) continue;
        errors.push({
          code: "ERR_STALE_REF",
          file: entry.file,
          id: entry.id,
          line: entry.headingLine,
          message: `links names ${member}, superseded by ${by.get(member) ?? "a later decision"}`,
        });
      }
    }
    return errors;
  },
};
