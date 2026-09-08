/**
 * `dsk status`, the derived-state census (R12).
 *
 * Why it exists here rather than at M3. M2-REVIEW.md section 2.2 names
 * `dsk status` as one of the two surfaces that must carry the criteria
 * stale-scope warning, and applying that ruling in full means the surface has
 * to exist. It is also the deterministic backend the M3 skill's `/status`
 * reads, which is what makes S6 gradeable against a scripted census instead of
 * against prose. Recorded as an interpretation call in F-050.
 *
 * Pure and clock-free, like `validate` and unlike `staleness`: every answer
 * here is derived from pointers, and pointers do not age. Nothing in this file
 * reads the environment, the filesystem or a clock.
 *
 * Every status it reports is DERIVED, never read off the entry, which is the
 * whole thesis of the kit stated in one function:
 *   - a decision is superseded iff a later decision names it (D-021);
 *   - a flag is resolved iff a sign-off names it (D-025);
 *   - a criterion is met iff a sign-off names it (D-027).
 * Where a written word disagrees with the derivation, both are reported. The
 * disagreement is information: it is what F-005 to F-024 look like in this
 * repository's own ledger, and hiding it would be the claim D-021 exists to
 * stop the ledger making.
 *
 * The one written field that is reported on its own terms is a decision's
 * `status:`. D-021 shrank that vocabulary to `proposed` and `locked` but minted
 * no derivation for it: locking is an act, not a consequence of a pointer. So
 * `locked` and `proposed` are counted as written, and said to be written.
 */
import { field, metCriteria, resolvedFlags, staleScopeWarnings, supersededDecisions } from "./rules/helpers.js";
import type { Counts, Entry, StaleScopeWarning, Tree } from "./types.js";

export interface StatusReport {
  readonly counts: Counts;
  readonly decisions: {
    /** Derived (D-021). */
    readonly current: readonly string[];
    readonly superseded: readonly string[];
    /** Written, and authoritative: D-021 minted no derivation for locking. */
    readonly written_locked: readonly string[];
    readonly written_proposed: readonly string[];
  };
  readonly flags: {
    /** Derived (D-025). */
    readonly open: readonly string[];
    readonly resolved: readonly string[];
  };
  readonly criteria: {
    /** Derived (D-027). */
    readonly met: readonly string[];
    readonly open: readonly string[];
    /** Advisory only in v0.1, so it is shown beside the derivation, not in it. */
    readonly written_dropped: readonly string[];
  };
  readonly signoffs: readonly string[];
  /** Criteria scoping a superseded decision (M2-REVIEW 2.2). */
  readonly warnings: readonly StaleScopeWarning[];
  /**
   * Entries whose written status word disagrees with the derived one. Not a
   * defect: D-021 forbids editing a committed line, so a status word can never
   * move and disagreement is the expected steady state after any transition.
   */
  readonly advisory_mismatches: readonly { readonly id: string; readonly written: string; readonly derived: string }[];
}

const idsOf = (entries: readonly Entry[]) => entries.map((e) => e.id);

export function status(tree: Tree): StatusReport {
  const superseded = supersededDecisions(tree);
  const resolved = resolvedFlags(tree);
  const met = metCriteria(tree);
  const of = (kind: Entry["kind"]) => tree.entries.filter((e) => e.kind === kind);

  const decisions = of("decision");
  const flags = of("flag");
  const criteria = of("criterion");

  const mismatches: { id: string; written: string; derived: string }[] = [];
  const note = (entry: Entry, derived: string) => {
    const written = field(entry, "status");
    if (written !== undefined && written !== derived) mismatches.push({ id: entry.id, written, derived });
  };
  for (const e of flags) note(e, resolved.has(e.id) ? "resolved" : "open");
  for (const e of criteria) note(e, met.has(e.id) ? "met" : "open");

  return {
    counts: tree.counts,
    decisions: {
      current: idsOf(decisions.filter((e) => !superseded.has(e.id))),
      superseded: idsOf(decisions.filter((e) => superseded.has(e.id))),
      written_locked: idsOf(decisions.filter((e) => field(e, "status") === "locked")),
      written_proposed: idsOf(decisions.filter((e) => field(e, "status") === "proposed")),
    },
    flags: {
      open: idsOf(flags.filter((e) => !resolved.has(e.id))),
      resolved: idsOf(flags.filter((e) => resolved.has(e.id))),
    },
    criteria: {
      met: idsOf(criteria.filter((e) => met.has(e.id))),
      open: idsOf(criteria.filter((e) => !met.has(e.id))),
      written_dropped: idsOf(criteria.filter((e) => field(e, "status") === "dropped")),
    },
    signoffs: idsOf(of("signoff")),
    warnings: staleScopeWarnings(tree),
    advisory_mismatches: mismatches,
  };
}

/** The session-start briefing R12 asks for, and what S5 and S6 read. */
export function humanStatus(report: StatusReport, root: string): string {
  const { counts, decisions, flags, criteria } = report;
  const list = (ids: readonly string[]) => (ids.length === 0 ? "none" : ids.join(", "));
  const lines = [
    `dsk: ${root}`,
    `  ${counts.decisions} decisions, ${counts.flags} flags, ${counts.criteria} criteria, ${counts.signoffs} sign-offs`,
    "",
    `  decisions current    ${decisions.current.length}  ${list(decisions.current)}`,
    `  decisions superseded ${decisions.superseded.length}  ${list(decisions.superseded)}`,
    `  flags open           ${flags.open.length}  ${list(flags.open)}`,
    `  flags resolved       ${flags.resolved.length}  ${list(flags.resolved)}`,
    `  criteria met         ${criteria.met.length}  ${list(criteria.met)}`,
    `  criteria open        ${criteria.open.length}  ${list(criteria.open)}`,
  ];
  if (criteria.written_dropped.length > 0)
    lines.push(`  written dropped      ${criteria.written_dropped.length}  ${list(criteria.written_dropped)} (advisory, D-027)`);
  if (report.warnings.length > 0) {
    lines.push("", "  warnings, criteria scoping a superseded decision (M2-REVIEW 2.2):");
    for (const w of report.warnings)
      lines.push(`    ${w.id}  scope names ${w.member}, superseded by ${w.superseded_by}`);
  }
  if (report.advisory_mismatches.length > 0) {
    lines.push(
      "",
      `  ${report.advisory_mismatches.length} entr${report.advisory_mismatches.length === 1 ? "y" : "ies"} whose written status differs from the derived one.`,
      "  Expected, not a defect: D-021 forbids editing a committed line, so the",
      "  derived answer is the authoritative one (D-025, D-027).",
    );
  }
  lines.push("", "  Every status above is derived from pointers, never read off the entry.");
  return lines.join("\n") + "\n";
}
