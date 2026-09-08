/**
 * Shared predicates for the rule modules. Not a rule itself: D-011 says one
 * module per error code, and this file mints no code.
 */
import { parseList } from "../parse.js";
import type { Entry, Tree } from "../types.js";

/** SCHEMA.md section 3: a prefix plus exactly three zero-padded digits. */
export const ID_RE = /^(?:D|F|S|AC)-\d{3}$/;
export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const AUTHOR_WORDS = new Set(["human", "agent"]);

export function field(entry: Entry, key: string): string | undefined {
  return entry.fields.get(key)?.value;
}

/** Absent, empty, or the literal `none` all read as "not supplied". */
export function unset(value: string | undefined): boolean {
  return value === undefined || value === "" || value === "none";
}

/**
 * The provenance block SCHEMA.md section 2 defines, per entry type (F-027):
 * `author` and `date` on decisions, `raised-by` and `date` on flags, `date` on
 * sign-offs, nothing on criteria. Shared so ERR_PROVENANCE and ERR_MODEL_ID
 * cannot drift apart: the schema conditions the second on the first, and they
 * did drift once (F-035).
 */
export interface Provenance {
  /** The author-type field this entry kind uses, or null when it has none. */
  readonly authorKey: "author" | "raised-by" | null;
  readonly author: string | undefined;
  readonly authorMissing: boolean;
  readonly dateMissing: boolean;
  /** False when SCHEMA.md would say the entry "has no provenance block". */
  readonly present: boolean;
}

export function provenanceOf(entry: Entry): Provenance {
  const authorKey = entry.kind === "decision" ? "author" : entry.kind === "flag" ? "raised-by" : null;
  const author = authorKey === null ? undefined : field(entry, authorKey);
  const authorMissing = authorKey !== null && (author === undefined || !AUTHOR_WORDS.has(author));
  const dateMissing = field(entry, "date") === undefined;
  // Criteria carry neither field, so the concept does not apply to them at all.
  const present = entry.kind === "criterion" ? true : !authorMissing && !dateMissing;
  return { authorKey, author, authorMissing, dateMissing, present };
}

export function allIds(tree: Tree): Set<string> {
  return new Set(tree.entries.map((e) => e.id));
}

/**
 * Supersession by derivation (D-021): a decision is superseded if and only if
 * some other decision names it in `supersedes:`. Nothing is read off the
 * superseded entry itself, which is the whole point of the ruling.
 */
export function supersededDecisions(tree: Tree): Set<string> {
  const superseded = new Set<string>();
  for (const entry of tree.entries) {
    if (entry.kind !== "decision") continue;
    const raw = field(entry, "supersedes");
    if (unset(raw)) continue;
    for (const target of parseList(raw ?? "")) superseded.add(target);
  }
  return superseded;
}

/** ID-shaped members of a bracketed list field. Non-ID members are not links. */
export function idMembers(entry: Entry, key: string): string[] {
  const raw = field(entry, key);
  if (raw === undefined) return [];
  return parseList(raw).filter((m) => ID_RE.test(m));
}

/** The entry a given line of a ledger file falls inside, if any. */
export function entryAtLine(tree: Tree, file: string, line: number): Entry | undefined {
  let found: Entry | undefined;
  for (const entry of tree.entries) {
    if (entry.file !== file) continue;
    if (entry.headingLine <= line) found = entry;
  }
  return found;
}
