/**
 * The four-surface byte-identity invariant, made checkable.
 *
 * Two committed files assert it in prose and nothing enforced it. AGENTS.md's
 * preamble says its `dsk:` block is "byte-identical to `templates/AGENTS.dsk.md`",
 * and PLAN.md's M3 section says the snippet is "embedded byte-identically into
 * this repo's `AGENTS.md`". The M3-REVIEW-2 adversarial pass listed the gap as
 * a pre-existing finding it could not verify inside the D-034 cap (F-070, third
 * item of the pre-existing list): an assertion in prose, enforced by nothing.
 *
 * It matters most in exactly the session that adds it. M3-REVIEW-3.md section
 * 3.1 requires the same wording change on all four surfaces, and the failure
 * mode of a four-file hand edit is that three of them land. `test/` is where
 * implementation-level regressions live (EVALS.md section 1.3), the four-surface
 * consistency is one, and nothing here touches an E5-sealed input.
 *
 * What is NOT asserted: that the two SKILL.md copies and the snippet say the
 * same thing as each other. They are different documents for different runtimes
 * and only the pairs below are claimed to be identical.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const TEMPLATE_SKILL = "templates/claude/skills/dsk/SKILL.md";
const INSTALLED_SKILL = ".claude/skills/dsk/SKILL.md";
const TEMPLATE_SNIPPET = "templates/AGENTS.dsk.md";
const HOST = "AGENTS.md";

/** The `dsk:begin` .. `dsk:end` block of a host file, markers included. */
function block(text, file) {
  const begin = text.indexOf("<!-- dsk:begin");
  assert.notEqual(begin, -1, `${file} has no <!-- dsk:begin marker`);
  const endMarker = "<!-- dsk:end -->";
  const end = text.indexOf(endMarker, begin);
  assert.notEqual(end, -1, `${file} has no ${endMarker} after its begin marker`);
  assert.equal(
    text.indexOf("<!-- dsk:begin", begin + 1),
    -1,
    `${file} has more than one dsk:begin marker, so the block is ambiguous`,
  );
  return text.slice(begin, end + endMarker.length);
}

test("the installed skill is byte-identical to the shipped template", () => {
  const template = read(TEMPLATE_SKILL);
  const installed = read(INSTALLED_SKILL);
  assert.equal(
    installed,
    template,
    `${INSTALLED_SKILL} has drifted from ${TEMPLATE_SKILL}. E5 seals the template ` +
      `and grades the installed copy's behaviour; a divergence means the run does not ` +
      `measure what it sealed.`,
  );
});

test("this repo's AGENTS.md carries the snippet byte-identically (AGENTS.md preamble, PLAN.md M3)", () => {
  const template = read(TEMPLATE_SNIPPET);
  const embedded = block(read(HOST), HOST);
  // The template file is the block plus a trailing newline; compare the block.
  assert.equal(
    embedded,
    block(template, TEMPLATE_SNIPPET),
    `the dsk: block in ${HOST} has drifted from ${TEMPLATE_SNIPPET}. Both files ` +
      `state in prose that they are byte-identical, and E6 grades the template.`,
  );
});

test("the snippet template is exactly one dsk: block and nothing else", () => {
  const template = read(TEMPLATE_SNIPPET);
  assert.equal(
    template,
    block(template, TEMPLATE_SNIPPET) + "\n",
    `${TEMPLATE_SNIPPET} carries content outside its dsk: markers, so pasting the ` +
      `file and pasting the block are no longer the same act.`,
  );
});
