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
