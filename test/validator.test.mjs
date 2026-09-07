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
