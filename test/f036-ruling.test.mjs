/**
 * Unit tests for the F-036 ruling (M2-REVIEW.md section 2, D-027 and D-028).
 *
 * F-036 is the finding that supersession — the one legal correction the schema
 * has — permanently invalidated the tree. ERR_STALE_REF fired on any `links` or
 * `scope` member resolving to a superseded decision, and sign-offs can never be
 * edited or un-scoped, so superseding a signed decision left no legal exit.
 *
 * The ruling has four parts, and every one of them is a test here:
 *   2.1  sign-off `scope` is exempt from ERR_STALE_REF forever; ERR_SCOPE stays.
 *   2.2  criterion `scope` is downgraded to a staleness-report warning.
 *   2.3  ERR_STALE_REF stays hard exactly where it misleads: `links` on an
 *        entry that is itself current.
 *   2.4  D-027, a criterion is met if and only if a sign-off names it.
 *
 * Written before src/status.ts exists and before the rules were narrowed, and
 * red on arrival for every part but the two regression guards (EVALS.md section
 * 1.3, CLAUDE.md build rule 1). The frozen fixture inventory has no slot for
 * these: an INV fixture must be invalid and each of these trees is valid, and a
 * VAL fixture change would move its counts (M1-REVIEW 2.5, F-034).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadTree } from "../dist/load.js";
import { validate } from "../dist/validate.js";
import { metCriteria } from "../dist/rules/helpers.js";
import { staleness } from "../dist/staleness.js";
import { status } from "../dist/status.js";
import { render } from "../dist/render.js";

/** Materialises a tree on disk, hands back both the path and the loaded form. */
function make({ decisions = "", flags = "", criteria = "", signoffs = "" }) {
  const dir = mkdtempSync(join(tmpdir(), "dsk-f036-"));
  mkdirSync(join(dir, "state"), { recursive: true });
  const w = (f, b) => writeFileSync(join(dir, "state", f), b);
  w("state.yaml", 'schema: "0.1"\nproject: t\ncreated: 2026-09-01\nstaleness_days: 30\n');
  w("decisions.md", "# Decisions\n" + decisions);
  w("flags.md", "# Flags\n" + flags);
  w("criteria.md", "# Acceptance criteria\n" + criteria);
  w("signoffs.md", "# Sign-offs\n" + signoffs);
  return { dir, tree: loadTree(dir, null) };
}

function withTree(parts, fn) {
  const { dir, tree } = make(parts);
  try {
    return fn(tree, dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const DECISION = (id, { sup = "none", links = "" } = {}) =>
  `\n### ${id}: A decision\nstatus: locked\ndate: 2026-09-01\nowner: hamza\nauthor: human\n` +
  `model: none\nlinks: [${links}]\nsupersedes: ${sup}\n\nR.\n`;
const CRITERION = (id, scope, status = "open") => `\n### ${id}: A criterion\nstatus: ${status}\nscope: [${scope}]\n`;
const SIGNOFF = (id, scope) => `\n### ${id}\nactor: hamza\nrole: owner\ndate: 2026-09-02\nscope: [${scope}]\n`;
const codes = (dir) => validate(dir).errors.map((e) => e.code).sort();

/* ------------------------------------------------------------------ 2.1 */

test("superseding a signed decision leaves the tree valid (M2-REVIEW 2.1)", () => {
  // The exact reproduction in F-036: D-001 signed by S-001, then superseded.
  // Before the ruling this was ERR_STALE_REF on S-001, with no legal exit,
  // because a sign-off can never be edited or un-scoped.
  withTree(
    { decisions: DECISION("D-001") + DECISION("D-002", { sup: "D-001" }), signoffs: SIGNOFF("S-001", "D-001") },
    (_tree, dir) => assert.deepEqual(codes(dir), []),
  );
});

test("a sign-off scope member that does not exist is still ERR_SCOPE (M2-REVIEW 2.1)", () => {
  // The exemption is from staleness only. Existence is untouched, and this
  // guards against the fix being written as "skip sign-offs entirely".
  withTree({ decisions: DECISION("D-001"), signoffs: SIGNOFF("S-001", "AC-404") }, (_tree, dir) =>
    assert.deepEqual(codes(dir), ["ERR_SCOPE"]),
  );
});

/* ------------------------------------------------------------------ 2.2 */

test("a criterion scoping a superseded decision is a warning, not an error (M2-REVIEW 2.2)", () => {
  withTree(
    {
      decisions: DECISION("D-001") + DECISION("D-002", { sup: "D-001" }),
      criteria: CRITERION("AC-001", "D-001"),
    },
    (tree, dir) => {
      assert.deepEqual(codes(dir), []);
      const report = staleness(tree, "2026-09-10", 30);
      assert.deepEqual(
        report.stale_scope.map((w) => [w.id, w.member, w.superseded_by]),
        [["AC-001", "D-001", "D-002"]],
      );
      assert.equal(report.counts.stale_scope, 1);
    },
  );
});

test("the criterion warning survives into status and render (M2-REVIEW 2.2)", () => {
  withTree(
    {
      decisions: DECISION("D-001") + DECISION("D-002", { sup: "D-001" }),
      criteria: CRITERION("AC-001", "D-001"),
    },
    (tree) => {
      assert.deepEqual(
        status(tree).warnings.map((w) => `${w.id}:${w.member}`),
        ["AC-001:D-001"],
      );
      // The signal survives, the brick does not: it must be visible to a reader.
      assert.match(render(tree, "t"), /scope names D-001, superseded by D-002/);
    },
  );
});

test("a sign-off scoping a superseded decision raises no warning either (M2-REVIEW 2.1)", () => {
  // 2.1 says "forever", not "downgraded": a sign-off is an attestation of a
  // moment and a later supersession does not falsify it, so there is nothing
  // to warn about.
  withTree(
    { decisions: DECISION("D-001") + DECISION("D-002", { sup: "D-001" }), signoffs: SIGNOFF("S-001", "D-001") },
    (tree) => assert.deepEqual(staleness(tree, "2026-09-10", 30).stale_scope, []),
  );
});

/* ------------------------------------------------------------------ 2.3 */

test("links on a current entry naming a superseded decision is still hard (M2-REVIEW 2.3)", () => {
  // The case that genuinely misleads, and INV-04's case. Regression guard.
  withTree(
    {
      decisions:
        DECISION("D-001") + DECISION("D-002", { sup: "D-001" }) + DECISION("D-003", { links: "D-001" }),
    },
    (_tree, dir) => assert.deepEqual(codes(dir), ["ERR_STALE_REF"]),
  );
});

test("links on an entry that is itself superseded no longer fires (M2-REVIEW 2.3)", () => {
  // F-036's second reproduction: D-002 links D-001, D-003 supersedes D-001,
  // D-004 supersedes D-002. The error used to survive superseding the referrer,
  // so the append-only remedy D-021 promises did not exist for this code.
  withTree(
    {
      decisions:
        DECISION("D-001") +
        DECISION("D-002", { links: "D-001" }) +
        DECISION("D-003", { sup: "D-001" }) +
        DECISION("D-004", { sup: "D-002" }),
    },
    (_tree, dir) => assert.deepEqual(codes(dir), []),
  );
});

/* ------------------------------------------------------- 2.4, D-027 */

test("a criterion is met if and only if a sign-off names it (D-027)", () => {
  withTree(
    {
      decisions: DECISION("D-001"),
      criteria: CRITERION("AC-001", "D-001") + CRITERION("AC-002", "D-001", "met"),
      signoffs: SIGNOFF("S-001", "AC-001"),
    },
    (tree) => {
      const met = metCriteria(tree);
      // AC-001 is written `open` and signed: derived met.
      assert.equal(met.has("AC-001"), true);
      // AC-002 is written `met` and unsigned: the written word is advisory.
      assert.equal(met.has("AC-002"), false);
    },
  );
});

test("dropped stays advisory-only, so a dropped criterion derives open (D-027)", () => {
  withTree(
    { decisions: DECISION("D-001"), criteria: CRITERION("AC-001", "D-001", "dropped") },
    (tree) => {
      assert.equal(metCriteria(tree).has("AC-001"), false);
      const s = status(tree);
      assert.deepEqual(s.criteria.open, ["AC-001"]);
      assert.deepEqual(s.criteria.met, []);
      // Advisory, so it is shown rather than acted on.
      assert.deepEqual(s.criteria.written_dropped, ["AC-001"]);
    },
  );
});

test("render shows the derived criterion status and flags the disagreement (D-027)", () => {
  const page = withTree(
    {
      decisions: DECISION("D-001"),
      criteria: CRITERION("AC-001", "D-001", "met"),
      signoffs: SIGNOFF("S-001", "D-001"),
    },
    (tree) => render(tree, "t"),
  );
  // Written `met`, no sign-off names it: derived open, and the written word is
  // shown as the advisory it is, exactly as D-025 made flag status advisory.
  assert.match(page, /written status: met/);
});

/* --------------------------------------------------------- status census */

test("status reports the census S6 grades against (R12)", () => {
  withTree(
    {
      decisions: DECISION("D-001") + DECISION("D-002", { sup: "D-001" }),
      flags: "\n### F-001: A flag\nstatus: open\ndate: 2026-09-01\nowner: hamza\nraised-by: human\nresolution: none\n",
      criteria: CRITERION("AC-001", "D-002"),
      signoffs: SIGNOFF("S-001", "AC-001"),
    },
    (tree) => {
      const s = status(tree);
      assert.deepEqual(s.counts, { decisions: 2, flags: 1, criteria: 1, signoffs: 1 });
      assert.deepEqual(s.decisions.current, ["D-002"]);
      assert.deepEqual(s.decisions.superseded, ["D-001"]);
      assert.deepEqual(s.flags.open, ["F-001"]);
      assert.deepEqual(s.flags.resolved, []);
      assert.deepEqual(s.criteria.met, ["AC-001"]);
    },
  );
});
