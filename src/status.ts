/**
 * `dsk status`, the derived-state census. NOT IMPLEMENTED YET.
 *
 * This is the M0 stub pattern (D-018: exit 2, "not implemented"), used here so
 * that test/f036-ruling.test.mjs reports each part of the M2-REVIEW section 2
 * ruling as its own named red result instead of failing once at module
 * resolution. Eval-first (D-007, CLAUDE.md build rule 1): the test exists and is
 * red before this file has behaviour.
 */
export function status(_tree: unknown): never {
  throw new Error("dsk status is not implemented yet (M2-REVIEW section 2.2)");
}
