/**
 * ERR_STATUS — SCHEMA.md section 2, as narrowed by D-021: the decision
 * vocabulary is `proposed` and `locked` only, and `superseded-by:` is gone.
 * Fixture: INV-03.
 */
import { field } from "./helpers.js";
import type { DskError, EntryKind, Rule } from "../types.js";

const VOCABULARY: Partial<Record<EntryKind, ReadonlySet<string>>> = {
  decision: new Set(["proposed", "locked"]),
  flag: new Set(["open", "resolved"]),
  criterion: new Set(["open", "met", "dropped"]),
};

export const rule: Rule = {
  code: "ERR_STATUS",
  run(tree) {
    const errors: DskError[] = [];
    for (const entry of tree.entries) {
      const allowed = VOCABULARY[entry.kind];
      if (allowed === undefined) continue; // sign-offs carry no status
      const status = field(entry, "status");
      if (status !== undefined && allowed.has(status)) continue;
      errors.push({
        code: "ERR_STATUS",
        file: entry.file,
        id: entry.id,
        line: entry.headingLine,
        message:
          status === undefined
            ? `${entry.kind} has no status`
            : `unknown ${entry.kind} status '${status}'`,
      });
    }
    return errors;
  },
};
