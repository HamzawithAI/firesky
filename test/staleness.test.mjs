/**
 * Unit tests for R20 staleness and for D-025's derived flag resolution.
 *
 * E4 grades the whole report against three expected outputs; these cover the
 * pieces E4 exercises only in one direction, above all a flag that a sign-off
 * DOES name, which VAL-04 has none of. Written before src/staleness.ts exists
 * (EVALS.md section 1.3, CLAUDE.md build rule 1).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadTree } from "../dist/load.js";
import { resolvedFlags } from "../dist/rules/helpers.js";
import { staleness } from "../dist/staleness.js";

function tree({ decisions = "", flags = "", signoffs = "", stalenessDays = 30 }) {
  const dir = mkdtempSync(join(tmpdir(), "dsk-stale-"));
  mkdirSync(join(dir, "state"), { recursive: true });
  const w = (f, b) => writeFileSync(join(dir, "state", f), b);
  w("state.yaml", `schema: "0.1"\nproject: t\ncreated: 2026-09-01\nstaleness_days: ${stalenessDays}\n`);
  w("decisions.md", "# Decisions\n" + decisions);
  w("flags.md", "# Flags\n" + flags);
  w("criteria.md", "# Acceptance criteria\n");
  w("signoffs.md", "# Sign-offs\n" + signoffs);
  try {
    return loadTree(dir, null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const FLAG = (id, date) => `\n### ${id}: A flag\nstatus: open\ndate: ${date}\nowner: hamza\nraised-by: human\nresolution: none\n`;
const SIGNOFF = (id, date, scope) => `\n### ${id}\nactor: hamza\nrole: owner\ndate: ${date}\nscope: [${scope}]\n`;
const DECISION = (id, date, sup = "none") =>
  `\n### ${id}: A decision\nstatus: locked\ndate: ${date}\nowner: hamza\nauthor: human\nmodel: none\nlinks: []\nsupersedes: ${sup}\n\nR.\n`;

/* ------------------------------------------- D-025, resolution by derivation */

test("a flag is resolved when a sign-off names it, and open otherwise (D-025)", () => {
  const t = tree({
    flags: FLAG("F-001", "2026-09-01") + FLAG("F-002", "2026-09-01"),
    signoffs: SIGNOFF("S-001", "2026-09-02", "F-002"),
  });
  const resolved = resolvedFlags(t);
  assert.equal(resolved.has("F-002"), true);
  assert.equal(resolved.has("F-001"), false);
});

test("the flag's own status word is advisory, never the answer (D-025)", () => {
  // Says resolved, no sign-off names it: derived open.
  const t = tree({
    flags: "\n### F-001: A flag\nstatus: resolved\ndate: 2026-09-01\nowner: hamza\nraised-by: human\nresolution: done\n",
  });
  assert.equal(resolvedFlags(t).has("F-001"), false);
});

/* ------------------------------------------------------------- R20 staleness */

test("stale means strictly older than the window, so the boundary is exclusive", () => {
  const t = tree({ decisions: DECISION("D-001", "2026-09-01") + DECISION("D-002", "2026-09-02") });
  // 2026-09-10: D-001 is 9 days, D-002 is 8.
  assert.deepEqual(staleness(t, "2026-09-10", 8).stale.map((r) => r.id), ["D-001"]);
  assert.deepEqual(staleness(t, "2026-09-10", 9).stale.map((r) => r.id), []);
  assert.deepEqual(staleness(t, "2026-09-10", 7).stale.map((r) => r.id), ["D-001", "D-002"]);
});

test("a superseded decision is reported stale but marked not current", () => {
  const t = tree({ decisions: DECISION("D-001", "2026-09-01") + DECISION("D-002", "2026-09-01", "D-001") });
  const rows = staleness(t, "2026-09-10", 6).stale;
  assert.equal(rows.find((r) => r.id === "D-001").current, false);
  assert.equal(rows.find((r) => r.id === "D-002").current, true);
});

test("open_flags carries the owner and excludes flags a sign-off resolved", () => {
  const t = tree({
    flags: FLAG("F-001", "2026-09-01") + FLAG("F-002", "2026-09-01"),
    signoffs: SIGNOFF("S-001", "2026-09-02", "F-002"),
  });
  const r = staleness(t, "2026-09-10", 6);
  assert.deepEqual(r.open_flags.map((x) => x.id), ["F-001"]);
  assert.equal(r.open_flags[0].owner, "hamza");
  // F-002 is still stale; it is simply no longer open.
  assert.equal(r.stale.some((x) => x.id === "F-002"), true);
});

test("undated and impossible dates are counted, never silently dropped", () => {
  const t = tree({
    decisions:
      DECISION("D-001", "2026-09-01") +
      "\n### D-002: No date\nstatus: locked\nowner: hamza\nauthor: human\nmodel: none\n\nR.\n" +
      "\n### D-003: Impossible date\nstatus: locked\ndate: 2026-13-45\nowner: hamza\nauthor: human\nmodel: none\n\nR.\n",
  });
  const r = staleness(t, "2026-09-10", 6);
  assert.equal(r.counts.entries, 3);
  assert.equal(r.counts.dated, 1);
  assert.equal(r.counts.undated, 2);
  assert.deepEqual(r.stale.map((x) => x.id), ["D-001"]);
});

test("rows are ordered by file then line, which is a total order", () => {
  const t = tree({
    decisions: DECISION("D-001", "2026-09-01"),
    flags: FLAG("F-001", "2026-09-01"),
    signoffs: SIGNOFF("S-001", "2026-09-01", "D-001"),
  });
  assert.deepEqual(staleness(t, "2026-09-10", 6).stale.map((r) => r.file), [
    "state/decisions.md",
    "state/flags.md",
    "state/signoffs.md",
  ]);
});

test("the report reads its own window and clock back, so output is self-describing", () => {
  const r = staleness(tree({}), "2026-09-10", 30);
  assert.equal(r.now, "2026-09-10");
  assert.equal(r.window_days, 30);
});
