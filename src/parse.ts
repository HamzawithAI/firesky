/**
 * Hand-rolled line-oriented ledger parser (D-010). No markdown AST.
 *
 * The grammar (SCHEMA.md section 2): one heading line, then `key: value` lines
 * until a blank line, then optional prose until the next heading or end of file.
 * Everything before the first `### ` heading is preamble and is ignored (F-010),
 * which is what keeps a titled-but-empty ledger such as VAL-01's `criteria.md`
 * legal.
 */
import type { DuplicateKey, Entry, EntryKind, Field } from "./types.js";

const HEADING = "### ";
const FIELD_RE = /^([A-Za-z][A-Za-z0-9_-]*):[ \t]?(.*)$/;

export function parseLedger(file: string, kind: EntryKind, text: string): Entry[] {
  const lines = text.split("\n");
  const entries: Entry[] = [];
  let i = 0;

  while (i < lines.length) {
    if (!(lines[i] ?? "").startsWith(HEADING)) {
      i++;
      continue;
    }

    const headingLine = i + 1;
    const heading = (lines[i] ?? "").slice(HEADING.length).trim();
    // Split on the first colon only: `### F-027: ERR_PROVENANCE's "on any entry"...`
    // keeps its colons in the title, and `### S-001` has none at all.
    const colon = heading.indexOf(":");
    const id = (colon === -1 ? heading : heading.slice(0, colon)).trim();
    const title = colon === -1 ? "" : heading.slice(colon + 1).trim();
    i++;

    const fields = new Map<string, Field>();
    // Last writer wins, which is what a line-oriented parser has to do, and is
    // exactly why the repetition is recorded: the occurrence that loses would
    // otherwise disappear, taking a rule's precondition with it (ERR_DUP_KEY,
    // D-033). The parser still does not repair anything; it reports.
    const duplicateKeys: DuplicateKey[] = [];
    while (i < lines.length) {
      const line = lines[i] ?? "";
      if (line.trim() === "" || line.startsWith(HEADING)) break;
      const m = FIELD_RE.exec(line);
      // A non-matching line inside the field block is left unparsed rather than
      // guessed at. No rule asserts on it, and inventing one would be R9's
      // "silently fixed" failure in the validator itself.
      if (m && m[1] !== undefined) {
        if (fields.has(m[1])) duplicateKeys.push({ key: m[1], line: i + 1 });
        fields.set(m[1], { value: (m[2] ?? "").trim(), line: i + 1 });
      }
      i++;
    }

    const prose: string[] = [];
    while (i < lines.length) {
      const line = lines[i] ?? "";
      if (line.startsWith(HEADING)) break;
      if (line.trim() !== "") prose.push(line);
      i++;
    }

    entries.push({ kind, file, id, title, headingLine, fields, duplicateKeys, prose });
  }

  return entries;
}

/** `[D-003, AC-001]` -> `["D-003", "AC-001"]`. A bare or empty list yields []. */
export function parseList(raw: string): string[] {
  const inner = raw.trim().replace(/^\[/, "").replace(/\]$/, "");
  return inner
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
