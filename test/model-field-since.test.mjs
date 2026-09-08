/**
 * Regression tests for the dated `model:` rule (D-024) and for the provenance
 * precondition SCHEMA.md section 2 already states (F-035).
 *
 * These live in test/ rather than the E1 inventory for the reason M1-REVIEW.md
 * section 2.5 gives: M0-REVIEW.md section 5 freezes the inventory at INV-01 to
 * INV-17, and the *green* side of the cutoff has no fixture slot to occupy —
 * an INV fixture must be invalid. INV-17 pins the red side (F-034).
 *
 * Written before the rule change and red on purpose (EVALS.md section 1.3).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validate } from "../dist/validate.js";

/** A tree that is green apart from whatever the caller injects. */
function treeWith({ decisions = "", flags = "" }) {
  const dir = mkdtempSync(join(tmpdir(), "dsk-since-"));
  mkdirSync(join(dir, "state"), { recursive: true });
  const w = (f, body) => writeFileSync(join(dir, "state", f), body);
  w("state.yaml", 'schema: "0.1"\nproject: t\ncreated: 2026-09-01\nstaleness_days: 30\n');
  w("decisions.md", "# Decisions\n" + decisions);
  w("flags.md", "# Flags\n" + flags);
  w("criteria.md", "# Acceptance criteria\n");
  w("signoffs.md", "# Sign-offs\n");
  return dir;
}

function codesFor(id, trees) {
  const dir = treeWith(trees);
  try {
    return validate(dir).errors.filter((e) => e.id === id).map((e) => e.code).sort();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const flag = (date, extra = "") =>
  `\n### F-001: A flag\nstatus: open\n${date === null ? "" : `date: ${date}\n`}owner: hamza\nraised-by: agent\n${extra}resolution: none\n`;

const decision = (date, extra = "") =>
  `\n### D-001: A decision\nstatus: locked\n${date === null ? "" : `date: ${date}\n`}owner: hamza\nauthor: agent\n${extra}links: []\nsupersedes: none\n\nRationale.\n`;

/* ------------------------------------------------- D-024, the dated cutoff */

test("a flag dated before MODEL_FIELD_SINCE needs no model id (D-024)", () => {
  assert.deepEqual(codesFor("F-001", { flags: flag("2026-09-07") }), []);
});

test("a flag dated on MODEL_FIELD_SINCE needs a model id (D-024)", () => {
  assert.deepEqual(codesFor("F-001", { flags: flag("2026-09-08") }), ["ERR_MODEL_ID"]);
});

test("a flag dated after MODEL_FIELD_SINCE needs a model id (D-024)", () => {
  assert.deepEqual(codesFor("F-001", { flags: flag("2026-09-09") }), ["ERR_MODEL_ID"]);
});

test("a post-cutoff flag that carries its model id is clean", () => {
  assert.deepEqual(codesFor("F-001", { flags: flag("2026-09-08", "model: claude-opus-5\n") }), []);
});

test("the grandfather is flag-only: a pre-cutoff agent decision still needs its model id", () => {
  assert.deepEqual(codesFor("D-001", { decisions: decision("2026-09-01", "model: none\n") }), ["ERR_MODEL_ID"]);
});

/* ------------ F-035, SCHEMA.md section 2: no model check without provenance */

test("a dateless agent flag reports the missing provenance only, not the model id", () => {
  assert.deepEqual(codesFor("F-001", { flags: flag(null) }), ["ERR_PROVENANCE"]);
});

test("a dateless agent decision reports the missing provenance only, not the model id", () => {
  assert.deepEqual(codesFor("D-001", { decisions: decision(null, "model: none\n") }), ["ERR_PROVENANCE"]);
});

test("a non-ISO-dated agent flag reports the date only: it is not provably post-cutoff", () => {
  assert.deepEqual(codesFor("F-001", { flags: flag("07/09/2026") }), ["ERR_DATE"]);
});

/* --------------------------- F-038, the empty-value half of the same defect */

test("an empty date value is an absent one: provenance only, no date, no model id", () => {
  assert.deepEqual(codesFor("D-001", { decisions: decision("", "model: none\n") }), ["ERR_PROVENANCE"]);
});

test("an empty date value on a flag reports provenance only", () => {
  assert.deepEqual(codesFor("F-001", { flags: flag("") }), ["ERR_PROVENANCE"]);
});
