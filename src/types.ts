/**
 * Shared types for the dsk validator.
 *
 * The JSON contract in SCHEMA.md section 5 is the public surface; everything
 * else here exists to produce it deterministically, with zero network and zero
 * LLM calls (law 2, P2, R18).
 */

/** The four ledgers of SCHEMA.md section 1, in the order counts are reported. */
export type EntryKind = "decision" | "flag" | "criterion" | "signoff";

export interface Field {
  readonly value: string;
  /** 1-based line of the `key: value` line itself. */
  readonly line: number;
}

/**
 * One ledger entry: a `### ` heading, its `key: value` block, and its prose.
 * Malformed entries are still entries — SCHEMA.md section 5 counts them.
 */
export interface Entry {
  readonly kind: EntryKind;
  /** Repo-relative, e.g. `state/decisions.md`. Reported verbatim in errors. */
  readonly file: string;
  /** Raw heading text before the first colon. `D-1` is an id; the grammar rule judges it. */
  readonly id: string;
  readonly title: string;
  /** 1-based line of the `### ` heading. Every error anchors here (F-008). */
  readonly headingLine: number;
  readonly fields: ReadonlyMap<string, Field>;
  /** Non-empty prose lines after the field block. Feeds ERR_RATIONALE. */
  readonly prose: readonly string[];
}

export interface DskError {
  readonly code: string;
  readonly file: string;
  /** The entry that carries the violation, never the one referenced by it. */
  readonly id: string | null;
  readonly line: number;
  readonly message: string;
}

export interface Counts {
  readonly decisions: number;
  readonly flags: number;
  readonly criteria: number;
  readonly signoffs: number;
}

/** A ledger file whose committed content is not a prefix of its new content. */
export interface AppendViolation {
  readonly file: string;
  /** 1-based line where the two versions first diverge. */
  readonly line: number;
}

export interface StateYaml {
  readonly present: boolean;
  readonly keys: ReadonlySet<string>;
}

export interface Tree {
  readonly root: string;
  readonly entries: readonly Entry[];
  readonly counts: Counts;
  readonly stateYaml: StateYaml;
  /**
   * Result of the parent-commit diff (D-012), or null when the check does not
   * apply: the target is not the root of a git repository, or HEAD has no
   * parent. Never a silent pass — null means "not checkable here".
   */
  readonly appendViolations: readonly AppendViolation[] | null;
}

export interface ValidateResult {
  readonly ok: boolean;
  readonly errors: readonly DskError[];
  readonly counts: Counts;
}

/** D-011: one module per error code, each shipping its own fixture pair. */
export interface Rule {
  readonly code: string;
  run(tree: Tree): DskError[];
}
