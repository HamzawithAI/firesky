/**
 * Unit tests for D-035, the same-entry supersedes exemption to ERR_STALE_REF
 * (M3-REVIEW-2.md section 2.1, closing F-066).
 *
 * The finding: the one worked supersede example the kit ships wrote
 * `links: [D-001]` beside `supersedes: D-001`, and D-028 clause 3 made that a
 * hard error, because a superseding entry is current by construction and its
 * `links` member resolves to a decision that is superseded — by that very entry.
 * So the documented recipe produced a red tree every time an agent followed it
 * literally, and one E5 S3 trial did exactly that against a hard 5-of-5 gate.
 *
 * The ruling: a `links` member is exempt when the same entry's `supersedes`
 * field names the same id. A reference co-located with its own supersedes
 * declaration is self-evidently historical, not a superseded context being
 * treated as live, which is the only thing the code exists to catch.
 *
 * These tests were written before src/rules/stale-ref.ts was amended and were
 * red on arrival (EVALS.md section 1.3, CLAUDE.md build rule 1). The exemption
 * is narrow, and the tests below are mostly about how narrow: everything
 * D-028 caught before, it still catches.
 *
 * The frozen fixture inventory holds one of these as a valid case — VAL-02
 * gained D-005 and D-006 in the same commit as this file (F-067) — and the
 * boundary cases live here, because an INV fixture must be invalid and each of
 * these trees but one is valid (M1-REVIEW 2.5, EVALS.md section 1.3).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "../dist/validate.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function make(decisions) {
  const dir = mkdtempSync(join(tmpdir(), "dsk-d035-"));
  mkdirSync(join(dir, "state"), { recursive: true });
  const w = (f, b) => writeFileSync(join(dir, "state", f), b);
  w("state.yaml", 'schema: "0.1"\nproject: t\ncreated: 2026-09-01\nstaleness_days: 30\n');
  w("decisions.md", "# Decisions\n" + decisions);
  w("flags.md", "# Flags\n");
  w("criteria.md", "# Acceptance criteria\n");
  w("signoffs.md", "# Sign-offs\n");
  return dir;
}

const DECISION = (id, { sup = "none", links = "" } = {}) =>
  `\n### ${id}: A decision\nstatus: locked\ndate: 2026-09-01\nowner: hamza\nauthor: human\n` +
  `model: none\nlinks: [${links}]\nsupersedes: ${sup}\n\nR.\n`;

function codes(decisions) {
  const dir = make(decisions);
  try {
    return validate(dir).errors.map((e) => e.code).sort();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/* ------------------------------------------------------------ the exemption */

test("a superseding entry may link the entry it supersedes (D-035)", () => {
  // The exact reproduction in F-066, and what E5 S3 trial 4 wrote.
  assert.deepEqual(codes(DECISION("D-001") + DECISION("D-002", { sup: "D-001", links: "D-001" })), []);
});

test("the exemption survives other members in the same links list (D-035)", () => {
  // Trial 4 wrote `links: [D-001, PROJECT.md#3]`. Non-id members are not links
  // at all, and the exempt member sits beside them rather than alone.
  assert.deepEqual(
    codes(DECISION("D-001") + DECISION("D-002", { sup: "D-001", links: "D-001, PROJECT.md#3" })),
    [],
  );
});

/* --------------------------------------------------------- and its boundary */

test("linking a DIFFERENT superseded decision still fires (D-035 is narrow)", () => {
  // D-004 supersedes D-003 and is exempt for D-003 — and names D-001, which
  // D-002 superseded and which D-004 has no supersedes claim over. That is a
  // live entry pointing at dead context, which is exactly what D-028 clause 3
  // exists to catch, and the exemption must not reach it.
  assert.deepEqual(
    codes(
      DECISION("D-001") +
        DECISION("D-002", { sup: "D-001" }) +
        DECISION("D-003") +
        DECISION("D-004", { sup: "D-003", links: "D-001, D-003" }),
    ),
    ["ERR_STALE_REF"],
  );
});

test("INV-04's shape is untouched: supersedes none, links a superseded id", () => {
  // The frozen fixture's own case, restated as a unit test so a future widening
  // of the exemption cannot quietly retire the fixture that guards it.
  assert.deepEqual(
    codes(DECISION("D-001") + DECISION("D-002", { sup: "D-001" }) + DECISION("D-003", { links: "D-001" })),
    ["ERR_STALE_REF"],
  );
});

test("a non-superseding entry gets no exemption from a supersedes: none line", () => {
  // Guards the fix being written as "skip the check when supersedes is set",
  // which `none` would satisfy under a sloppy truthiness test.
  assert.deepEqual(
    codes(DECISION("D-001") + DECISION("D-002", { sup: "D-001" }) + DECISION("D-003", { sup: "none", links: "D-001" })),
    ["ERR_STALE_REF"],
  );
});

test("ERR_LINK is untouched: an exempt-looking member that resolves to nothing", () => {
  // The exemption is from staleness, never from existence — the same line
  // D-028 clause 1 draws for sign-off scope.
  assert.deepEqual(codes(DECISION("D-002", { sup: "D-404", links: "D-404" })), ["ERR_LINK"]);
});

/* ------------------------------- the shipped artifact, graded as an artifact */

/**
 * F-066's root cause was not in the validator, it was in the documentation: the
 * one worked supersede example the kit ships was invalid under its own schema,
 * on three surfaces. Nothing graded those surfaces, so the defect reached an E5
 * trial before anything noticed. This does.
 *
 * The example is lifted out of the shipped file and appended to a tree holding
 * the decision it names. If a future edit reintroduces an invalid recipe on any
 * of these surfaces, this goes red here rather than in a paid scenario run.
 */
const SURFACES = [
  ["templates/claude/skills/dsk/SKILL.md", "the skill (L2)"],
  [".claude/skills/dsk/SKILL.md", "the skill as installed in this repo"],
  ["templates/AGENTS.dsk.md", "the R11 cross-runtime snippet"],
  ["AGENTS.md", "this repo's own AGENTS.md"],
];

/** Every fenced block that carries a `supersedes:` line naming a decision id. */
function supersedeExamples(text) {
  return [...text.matchAll(/```\n([\s\S]*?)```/g)]
    .map((m) => m[1])
    .filter((body) => /^supersedes:\s*D-\d{3}\s*$/m.test(body));
}

for (const [file, what] of SURFACES) {
  test(`the supersede example shipped in ${what} validates (F-066)`, () => {
    const text = readFileSync(join(ROOT, file), "utf8");
    const examples = supersedeExamples(text);
    assert.ok(examples.length > 0, `${file} ships no worked supersede example`);
    for (const body of examples) {
      const target = /^supersedes:\s*(D-\d{3})\s*$/m.exec(body)[1];
      // The example says `model: <your exact model id>` in the snippet, which is
      // a placeholder for the reader, not a value. Substituting a real id keeps
      // the test about the supersede pattern rather than about the placeholder.
      const entry = body.replace(/^model:.*$/m, "model: claude-opus-5").replace(/^author:.*$/m, "author: agent");
      const seed = DECISION(target).replace(": A decision", ": The decision being superseded");
      assert.deepEqual(codes(seed + "\n" + entry), [], `${file}: the shipped example is invalid`);
    }
  });
}
