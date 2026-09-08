/**
 * Loads a `state/` tree from disk into the shape the rules consume.
 *
 * Reads only. Missing ledgers parse as empty rather than throwing, so that a
 * malformed tree still produces a JSON result with counts instead of a crash
 * (exit 2 is reserved for the CLI failing before it validates, D-018).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { parseLedger } from "./parse.js";
import type { Counts, Entry, EntryKind, StateYaml, Tree } from "./types.js";

export const LEDGERS: ReadonlyArray<{ file: string; kind: EntryKind; count: keyof Counts }> = [
  { file: "state/decisions.md", kind: "decision", count: "decisions" },
  { file: "state/flags.md", kind: "flag", count: "flags" },
  { file: "state/criteria.md", kind: "criterion", count: "criteria" },
  { file: "state/signoffs.md", kind: "signoff", count: "signoffs" },
];

export const STATE_YAML = "state/state.yaml";

function loadStateYaml(root: string): StateYaml {
  const path = join(root, STATE_YAML);
  if (!existsSync(path)) return { present: false, keys: new Set(), stalenessDays: null };
  let parsed: unknown;
  try {
    parsed = parseYaml(readFileSync(path, "utf8"));
  } catch {
    // Unparseable yaml has no schema key, which is what ERR_SCHEMA_VERSION says.
    return { present: true, keys: new Set(), stalenessDays: null };
  }
  const record = parsed !== null && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const raw = record["staleness_days"];
  const stalenessDays = typeof raw === "number" && Number.isInteger(raw) && raw >= 0 ? raw : null;
  return { present: true, keys: new Set(Object.keys(record)), stalenessDays };
}

export function loadTree(root: string, appendViolations: Tree["appendViolations"]): Tree {
  const entries: Entry[] = [];
  const counts = { decisions: 0, flags: 0, criteria: 0, signoffs: 0 };

  for (const ledger of LEDGERS) {
    const path = join(root, ledger.file);
    if (!existsSync(path)) continue;
    const parsed = parseLedger(ledger.file, ledger.kind, readFileSync(path, "utf8"));
    entries.push(...parsed);
    counts[ledger.count] = parsed.length;
  }

  return { root, entries, counts, stateYaml: loadStateYaml(root), appendViolations };
}
