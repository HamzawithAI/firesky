/**
 * ERR_PROVENANCE — defined by M0-REVIEW 4.5, which closed F-019: `author`
 * missing or invalid, or `date` absent.
 *
 * F-027 narrows "on any entry" to the fields each entry type's grammar actually
 * defines. Read literally the rule would fire on every criterion and every
 * sign-off in every green fixture, since criteria carry neither field and
 * sign-offs carry no author. Fixture: INV-06.
 */
import { AUTHOR_WORDS, field } from "./helpers.js";
import type { DskError, Entry, Rule } from "../types.js";

/** The provenance field each type uses for author type, or null if it has none. */
function authorField(entry: Entry): "author" | "raised-by" | null {
  if (entry.kind === "decision") return "author";
  if (entry.kind === "flag") return "raised-by";
  return null;
}

export const rule: Rule = {
  code: "ERR_PROVENANCE",
  run(tree) {
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      if (entry.kind === "criterion") continue; // no provenance fields at all (F-027)

      const key = authorField(entry);
      const author = key === null ? undefined : field(entry, key);
      const authorMissing = key !== null && (author === undefined || !AUTHOR_WORDS.has(author));
      const dateMissing = field(entry, "date") === undefined;
      if (!authorMissing && !dateMissing) continue;

      errors.push({
        code: "ERR_PROVENANCE",
        file: entry.file,
        id: entry.id,
        line: entry.headingLine,
        message: dateMissing
          ? "entry has no date"
          : author === undefined
            ? `entry has no ${key}`
            : `${key} '${author}' is neither human nor agent`,
      });
    }
    return errors;
  },
};
