/**
 * Unit tests on the pieces the fixtures exercise only indirectly (D-013, the
 * Node built-in runner, no framework). The eval suite remains the behavioural
 * oracle; these cover the parser and the git prefix rule directly.
 *
 * Requires a build: `npm run build` populates dist/.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLedger, parseList } from "../dist/parse.js";
import { firstDivergentLine } from "../dist/git.js";

test("parses a heading, its fields, and its prose", () => {
  const [entry] = parseLedger("state/decisions.md", "decision",
    "# Decisions\n\n### D-001: A title\nstatus: locked\nowner: hamza\n\nOne line.\nTwo lines.\n");
  assert.equal(entry.id, "D-001");
  assert.equal(entry.title, "A title");
  assert.equal(entry.headingLine, 3);
  assert.equal(entry.fields.get("owner").value, "hamza");
  assert.equal(entry.prose.length, 2);
});

test("splits the heading on the first colon only", () => {
  const [entry] = parseLedger("state/flags.md", "flag", '### F-027: "on any entry": a title\nstatus: open\n');
  assert.equal(entry.id, "F-027");
  assert.equal(entry.title, '"on any entry": a title');
});

test("a sign-off heading carries no colon and still yields an id", () => {
  const [entry] = parseLedger("state/signoffs.md", "signoff", "### S-001\nactor: hamza\n");
  assert.equal(entry.id, "S-001");
  assert.equal(entry.title, "");
});

test("preamble before the first heading is ignored, so an empty ledger is legal (F-010)", () => {
  assert.equal(parseLedger("state/criteria.md", "criterion", "# Acceptance criteria\n").length, 0);
});

test("prose is not parsed as fields", () => {
  const [entry] = parseLedger("state/flags.md", "flag",
    "### F-001: T\nstatus: open\n\nresolution: this line is prose, not a field.\n");
  assert.equal(entry.fields.has("resolution"), false);
  assert.equal(entry.prose.length, 1);
});

test("parseList reads bracketed comma lists and tolerates an empty one", () => {
  assert.deepEqual(parseList("[D-003, AC-001]"), ["D-003", "AC-001"]);
  assert.deepEqual(parseList("[]"), []);
});

test("a pure append is a prefix; an edit reports the first divergent line", () => {
  const base = "a\nb\n";
  // The append-only rule itself: committed content must prefix the new content.
  assert.equal("a\nb\nc\n".startsWith(base), true);
  // An edited line 2 diverges at line 2.
  assert.equal(firstDivergentLine(base, "a\nB\nc\n"), 2);
  // A removed line 2 also diverges at line 2, in HEAD's numbering.
  assert.equal(firstDivergentLine(base, "a\n"), 2);
  // An edited first line diverges at line 1.
  assert.equal(firstDivergentLine(base, "A\nb\n"), 1);
});

/* ------------------------------------------------------------- ERR_DUP_KEY */
/* D-033, M3-REVIEW.md section 5. The parser has to keep one occurrence of a
   repeated key; the point of the rule is that the one it drops was carrying a
   precondition. The eval fixture INV-19 covers the end-to-end case; these cover
   the parser's record and the rule's shape directly. */

test("the parser records a repeated key and keeps the last occurrence", () => {
  const [entry] = parseLedger("state/flags.md", "flag",
    "### F-001: A flag\nstatus: open\nraised-by: agent\nraised-by: human\nmodel: none\n");
  assert.deepEqual(entry.duplicateKeys, [{ key: "raised-by", line: 4 }]);
  assert.equal(entry.fields.get("raised-by").value, "human");
});

test("an entry with no repeated key records none", () => {
  const [entry] = parseLedger("state/flags.md", "flag",
    "### F-001: A flag\nstatus: open\nraised-by: agent\nmodel: claude-opus-5\n");
  assert.deepEqual(entry.duplicateKeys, []);
});

test("the same key three times is recorded twice, once per repetition", () => {
  const [entry] = parseLedger("state/decisions.md", "decision",
    "### D-001: A title\nowner: a\nowner: b\nowner: c\n");
  assert.deepEqual(entry.duplicateKeys.map((d) => d.line), [3, 4]);
  assert.equal(entry.fields.get("owner").value, "c");
});

test("ERR_DUP_KEY fires once per entry, anchored at the heading", async () => {
  const { rule } = await import("../dist/rules/dup-key.js");
  const entries = parseLedger("state/flags.md", "flag",
    "# Flags\n\n### F-001: A flag\nstatus: open\nowner: a\nowner: b\nraised-by: agent\nraised-by: human\n");
  const errors = rule.run({ entries });
  assert.equal(errors.length, 1);
  assert.equal(errors[0].code, "ERR_DUP_KEY");
  assert.equal(errors[0].id, "F-001");
  assert.equal(errors[0].line, 3, "anchored at the heading like every other code (F-008)");
  assert.match(errors[0].message, /'owner'/);
  assert.match(errors[0].message, /'raised-by'/);
});

test("a duplicated raised-by cannot hide an agent-raised flag from ERR_MODEL_ID", async () => {
  const { RULES } = await import("../dist/rules/index.js");
  const entries = parseLedger("state/flags.md", "flag",
    "# Flags\n\n### F-001: A flag\nstatus: open\ndate: 2026-09-08\nowner: hamza\nraised-by: agent\nraised-by: human\nmodel: none\nresolution: none\n");
  const tree = {
    root: ".",
    entries,
    counts: { decisions: 0, flags: 1, criteria: 0, signoffs: 0 },
    stateYaml: { present: true, keys: new Set(["schema"]), stalenessDays: 30 },
    appendViolations: null,
  };
  const codes = new Set(RULES.flatMap((r) => r.run(tree).map((e) => e.code)));
  // ERR_MODEL_ID is genuinely suppressed by the last-writer-wins read — that is
  // the F-052 close call — so ERR_DUP_KEY is the only thing standing between
  // this entry and a green tree.
  assert.equal(codes.has("ERR_MODEL_ID"), false);
  assert.equal(codes.has("ERR_DUP_KEY"), true);
});
