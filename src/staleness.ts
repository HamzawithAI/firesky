/**
 * R20, the staleness report. Deterministic and clock-injected (SCHEMA.md
 * section 4): this function reads no clock and no environment, the caller
 * passes `now`, which is what lets E4 assert three windows byte for byte.
 *
 * R20 is "entries untouched past a configurable window, open flags past their
 * owner-set date". The flag grammar has no owner-set date, and adding one is a
 * schema change law 6 argues against, so the second clause reads as the open
 * flags among the entries the first clause found (F-044). Both are reported,
 * separately, because R20 asks for them separately.
 *
 * It is a report, not a gate: no ERR_ code is minted for staleness, the
 * inventory is frozen at fifteen, and the CLI exits 0 whenever it ran (F-046).
 */
import { ISO_DATE_RE, field, resolvedFlags, supersededDecisions } from "./rules/helpers.js";
import type { Entry, Tree } from "./types.js";

const MS_PER_DAY = 86_400_000;

export interface StaleRow {
  readonly kind: string;
  readonly file: string;
  readonly id: string;
  readonly line: number;
  readonly date: string;
  readonly age_days: number;
  /** Derived, never read off the entry: D-021 for decisions, D-025 for flags. */
  readonly current: boolean;
}

export interface OpenFlagRow extends StaleRow {
  readonly owner: string;
}

export interface StalenessReport {
  readonly now: string;
  readonly window_days: number;
  readonly stale: readonly StaleRow[];
  readonly open_flags: readonly OpenFlagRow[];
  readonly counts: {
    readonly entries: number;
    readonly dated: number;
    readonly undated: number;
    readonly stale: number;
    readonly open_flags: number;
  };
}

/**
 * Midnight UTC for an ISO date, or null when the string is not one.
 *
 * The round-trip test rejects a date that parses but does not exist, such as
 * `2026-13-45`, which `Date.UTC` would silently roll over into 2027. ERR_DATE
 * is a format regex and accepts it (F-040, unruled); this refuses to compute an
 * age from it rather than reporting a nonsense number, and counts it as undated
 * so nothing is dropped without appearing in `counts`.
 */
function utcMidnight(iso: string): number | null {
  if (!ISO_DATE_RE.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const t = Date.UTC(y, m - 1, d);
  return new Date(t).toISOString().slice(0, 10) === iso ? t : null;
}

/** Whole days from `from` to `to`. Both midnight UTC, so no DST and no locale. */
function ageInDays(from: number, to: number): number {
  return Math.floor((to - from) / MS_PER_DAY);
}

export function staleness(tree: Tree, now: string, windowDays: number): StalenessReport {
  const nowMs = utcMidnight(now);
  if (nowMs === null) throw new Error(`not an ISO date: ${now}`);

  const superseded = supersededDecisions(tree);
  const resolved = resolvedFlags(tree);
  const isCurrent = (entry: Entry): boolean => {
    if (entry.kind === "decision") return !superseded.has(entry.id);
    if (entry.kind === "flag") return !resolved.has(entry.id);
    return true; // criteria carry no derivation; a sign-off is never undone
  };

  const stale: StaleRow[] = [];
  const open_flags: OpenFlagRow[] = [];
  let dated = 0;

  for (const entry of tree.entries) {
    const raw = field(entry, "date");
    const when = raw === undefined ? null : utcMidnight(raw);
    if (raw === undefined || when === null) continue;
    dated++;
    const age_days = ageInDays(when, nowMs);
    // Strictly older than the window, so an entry exactly at the boundary is
    // not yet stale. E4-08 pins that: nine days stale, eight days not.
    if (age_days <= windowDays) continue;

    const row: StaleRow = {
      kind: entry.kind,
      file: entry.file,
      id: entry.id,
      line: entry.headingLine,
      date: raw,
      age_days,
      current: isCurrent(entry),
    };
    stale.push(row);
    if (entry.kind === "flag" && isCurrent(entry)) {
      open_flags.push({ ...row, owner: field(entry, "owner") ?? "" });
    }
  }

  /* File then line is a total order over entries, so the output is byte-stable
     across machines and filesystem orderings. */
  const byPosition = (a: StaleRow, b: StaleRow) => a.file.localeCompare(b.file) || a.line - b.line;
  stale.sort(byPosition);
  open_flags.sort(byPosition);

  return {
    now,
    window_days: windowDays,
    stale,
    open_flags,
    counts: {
      entries: tree.entries.length,
      dated,
      undated: tree.entries.length - dated,
      stale: stale.length,
      open_flags: open_flags.length,
    },
  };
}
