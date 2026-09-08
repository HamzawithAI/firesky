/**
 * `dsk render` smoke and safety tests (PROJECT.md 6.2).
 *
 * The page is a view, never a source, so what matters is that it is
 * self-contained, that it escapes authored text, and above all that every
 * status it shows is DERIVED. Reading a status word off the entry would
 * reproduce in the human-facing view exactly the claim D-021 and D-025 exist to
 * stop the ledger making.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadTree } from "../dist/load.js";
import { render } from "../dist/render.js";

function html({ decisions = "", flags = "", signoffs = "" }) {
  const dir = mkdtempSync(join(tmpdir(), "dsk-render-"));
  mkdirSync(join(dir, "state"), { recursive: true });
  const w = (f, b) => writeFileSync(join(dir, "state", f), b);
  w("state.yaml", 'schema: "0.1"\nproject: t\ncreated: 2026-09-01\nstaleness_days: 30\n');
  w("decisions.md", "# Decisions\n" + decisions);
  w("flags.md", "# Flags\n" + flags);
  w("criteria.md", "# Acceptance criteria\n");
  w("signoffs.md", "# Sign-offs\n" + signoffs);
  try {
    return render(loadTree(dir, null), "t");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const DECISION = (id, sup = "none") =>
  `\n### ${id}: A decision\nstatus: locked\ndate: 2026-09-01\nowner: hamza\nauthor: human\nmodel: none\nlinks: []\nsupersedes: ${sup}\n\nR.\n`;
const FLAG = (id, status = "open") =>
  `\n### ${id}: A flag\nstatus: ${status}\ndate: 2026-09-01\nowner: hamza\nraised-by: human\nresolution: none\n`;
const SIGNOFF = (id, scope) => `\n### ${id}\nactor: hamza\nrole: owner\ndate: 2026-09-02\nscope: [${scope}]\n`;

const tagsFor = (page, id) => {
  const i = page.indexOf(`>${id}<`);
  const j = page.indexOf("<article", i);
  return [...page.slice(i, j === -1 ? undefined : j).matchAll(/<span class="tag [a-z ]*">([^<]*)</g)].map((m) => m[1]);
};

test("the page is self-contained: no script, no external asset", () => {
  const page = html({ decisions: DECISION("D-001") });
  assert.equal(/<script/i.test(page), false);
  assert.equal(/https?:\/\//.test(page), false);
});

test("authored text is escaped, not injected", () => {
  const page = html({
    decisions: "\n### D-001: <img src=x onerror=alert(1)>\nstatus: locked\ndate: 2026-09-01\nowner: hamza\nauthor: human\nmodel: none\n\nprose & <b>more</b>\n",
  });
  assert.equal(page.includes("<img src=x"), false);
  assert.equal(page.includes("&lt;img src=x"), true);
  assert.equal(page.includes("prose &amp; &lt;b&gt;more&lt;/b&gt;"), true);
});

test("a decision is superseded only by derivation, and the page names the successor (D-021)", () => {
  const page = html({ decisions: DECISION("D-001") + DECISION("D-002", "D-001") });
  assert.deepEqual(tagsFor(page, "D-001"), ["superseded", "superseded by D-002"]);
  assert.deepEqual(tagsFor(page, "D-002"), ["current"]);
});

test("a flag is resolved only when a sign-off names it, and the page names it (D-025)", () => {
  // Both written statuses agree with their derivation here, so this test sees
  // only the derivation. The disagreement case is the next test's subject.
  const page = html({ flags: FLAG("F-001", "open") + FLAG("F-002", "resolved"), signoffs: SIGNOFF("S-001", "F-002") });
  assert.deepEqual(tagsFor(page, "F-002"), ["resolved", "closed by S-001"]);
  assert.deepEqual(tagsFor(page, "F-001"), ["open"]);
});

test("where the written status disagrees with the derived one, the page shows both", () => {
  // The F-005..F-024 shape: text says open, S-003 closed it.
  const closed = html({ flags: FLAG("F-001", "open"), signoffs: SIGNOFF("S-001", "F-001") });
  assert.deepEqual(tagsFor(closed, "F-001"), ["resolved", "closed by S-001", "written status: open"]);
  // And the reverse: text says resolved, no sign-off names it.
  const stale = html({ flags: FLAG("F-001", "resolved") });
  assert.deepEqual(tagsFor(stale, "F-001"), ["open", "written status: resolved"]);
});

test("every entry gets exactly one card", () => {
  const page = html({
    decisions: DECISION("D-001") + DECISION("D-002"),
    flags: FLAG("F-001"),
    signoffs: SIGNOFF("S-001", "D-001"),
  });
  assert.equal((page.match(/<article class="entry">/g) ?? []).length, 4);
});
