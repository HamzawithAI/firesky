/**
 * D-037: the internal adversarial pass's budget becomes enforced.
 *
 * D-029 set a cap. D-034 said what the cap counts and that a pass approaching it
 * "stops and files the remainder as open flags instead of finishing large". Both
 * passes since then overran it — 1.96M against roughly 1M at M3, 1.73M at the
 * second M3 fix session (F-070) — because the script capped agents and nothing
 * else. M3-REVIEW-3.md section 4: "A rule without a deterministic check is a
 * wish, and this project of all projects does not get to keep wishes in its
 * process."
 *
 * This is that check. The pass script is `evals/adversarial-pass.wf.js`, and it
 * runs inside the Workflow tool, where there is no filesystem and no import — so
 * the guard cannot live in a module this test imports. It lives between two
 * marker comments in the script, self-contained by construction, and this test
 * lifts it out and runs it. That is the same technique the F-066 tests use on the
 * shipped supersede example: grade the artifact that ships, not a copy of it.
 *
 * These tests were written before the script existed and were red on arrival
 * (CLAUDE.md build rule 1, EVALS.md section 1.3): `evals/adversarial-pass.wf.js
 * is absent` on all of them.
 *
 * Zero LLM calls, zero network, no workflow runtime. The guard is pure
 * arithmetic over a spend reader the caller supplies, which is exactly why it can
 * be tested at all.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = "evals/adversarial-pass.wf.js";

const BEGIN = "/* --8<-- D-037 budget guard: begin.";
const END = "/* --8<-- D-037 budget guard: end.";

const source = readFileSync(join(ROOT, SCRIPT), "utf8");

/** The guard region of the shipped script, evaluated in isolation. */
function loadGuard() {
  const begin = source.indexOf(BEGIN);
  const end = source.indexOf(END);
  assert.notEqual(begin, -1, `${SCRIPT} has no D-037 guard begin marker`);
  assert.notEqual(end, -1, `${SCRIPT} has no D-037 guard end marker`);
  assert.ok(end > begin, `${SCRIPT}: the guard markers are in the wrong order`);
  const region = source.slice(begin, end);
  // Self-containment is the property that makes this testable at all: nothing
  // in the region may reach for a module or a workflow-runtime global. The
  // patterns are anchored so that prose mentioning a filename does not trip
  // them — `pass-budget.test.mjs` is not a use of `budget.`.
  for (const [what, re] of [
    ["a module load", /\bimport\s|\brequire\s*\(/],
    ["the budget global", /(^|[^\w.-])budget\s*\./m],
    ["a workflow global", /(^|[^\w.])(agent|parallel|pipeline|phase|log|workflow)\s*\(/m],
  ])
    assert.doesNotMatch(region, re, `the guard region must be self-contained: it reaches for ${what}`);
  return new Function(`${region}\nreturn makePassBudget;`)();
}

/** A spend reader whose value the test controls, in the guard's own unit. */
function meter(start = 0) {
  const m = { value: start };
  m.read = () => m.value;
  return m;
}

test("the guard admits work while both caps have room", () => {
  const makePassBudget = loadGuard();
  const m = meter();
  const b = makePassBudget({ tokens: 1000, agents: 5, spent: m.read });
  assert.equal(b.admit("lens:a"), true);
  m.value = 400;
  assert.equal(b.admit("lens:b"), true);
  assert.equal(b.aborted, false);
  assert.equal(b.spentSoFar(), 400);
});

test("the guard refuses at the token cap and stays refused", () => {
  const makePassBudget = loadGuard();
  const m = meter();
  const b = makePassBudget({ tokens: 1000, agents: 99, spent: m.read });
  assert.equal(b.admit("lens:a"), true);
  m.value = 1000; // exactly at the cap is at the cap, not under it
  assert.equal(b.admit("lens:b"), false);
  assert.equal(b.aborted, true);
  // A later reading that dips below the cap must not un-abort it: a pass that
  // stopped stays stopped, or "stops and files the remainder" means nothing.
  m.value = 10;
  assert.equal(b.admit("lens:c"), false);
  assert.deepEqual(b.refused, ["lens:b", "lens:c"]);
});

test("the guard refuses past the token cap even when the overshoot is large", () => {
  const makePassBudget = loadGuard();
  const m = meter();
  const b = makePassBudget({ tokens: 1000, agents: 99, spent: m.read });
  m.value = 1_730_637; // F-070's actual overrun
  assert.equal(b.admit("lens:a"), false);
  assert.equal(b.aborted, true);
  assert.equal(b.reason.includes("token"), true, `unexpected abort reason: ${b.reason}`);
});

test("the agent cap binds independently of tokens", () => {
  const makePassBudget = loadGuard();
  const m = meter();
  const b = makePassBudget({ tokens: 10_000_000, agents: 3, spent: m.read });
  assert.equal(b.admit("a"), true);
  assert.equal(b.admit("b"), true);
  assert.equal(b.admit("c"), true);
  assert.equal(b.admit("d"), false); // the fourth, against a cap of three
  assert.equal(b.aborted, true);
  assert.equal(b.reason.includes("agent"), true, `unexpected abort reason: ${b.reason}`);
  assert.equal(b.admitted, 3);
});

test("a spend reader that cannot report is treated as spent, not as free", () => {
  const makePassBudget = loadGuard();
  const b = makePassBudget({
    tokens: 1000,
    agents: 5,
    spent: () => {
      throw new Error("no budget accounting in this runtime");
    },
  });
  // Fail closed. An unreadable meter is the case where an unenforced cap is
  // most likely to be an unenforced cap for the whole pass.
  assert.equal(b.admit("lens:a"), false);
  assert.equal(b.aborted, true);
});

test("the guard reports the remainder it did not run, for filing as open flags", () => {
  const makePassBudget = loadGuard();
  const m = meter();
  const b = makePassBudget({ tokens: 1000, agents: 99, spent: m.read });
  const work = ["a", "b", "c", "d"];
  const ran = [];
  for (const w of work) {
    if (!b.admit(w)) continue;
    ran.push(w);
    m.value += 600;
  }
  assert.deepEqual(ran, ["a", "b"]);
  assert.deepEqual(b.remainder(work, ran), ["c", "d"]);
  assert.equal(b.aborted, true);
});

test("a non-positive or absent token cap is refused, not treated as unlimited", () => {
  const makePassBudget = loadGuard();
  const m = meter();
  for (const tokens of [undefined, null, 0, -1, NaN, "1000000"]) {
    assert.throws(
      () => makePassBudget({ tokens, agents: 5, spent: m.read }),
      /token/i,
      `a cap of ${String(tokens)} must be refused at construction`,
    );
  }
});

test("every agent call in the shipped script goes through the guard", () => {
  // The guard existing is not the rule. The rule is that there is no other way
  // to spawn an agent, which is what the last two passes actually got wrong.
  const calls = [...source.matchAll(/(\w*)\bagent\(/g)].map((m) => m[0]);
  const bare = calls.filter((c) => c === "agent(");
  assert.equal(
    bare.length,
    1,
    `expected exactly one bare agent( call — the one inside budgetedAgent — found ${bare.length}`,
  );
  const wrapper = source.indexOf("function budgetedAgent");
  assert.notEqual(wrapper, -1, `${SCRIPT} has no budgetedAgent wrapper`);
  const bareIndex = source.indexOf("\nagent(") === -1 ? source.search(/[^\w]agent\(/) : source.indexOf("\nagent(");
  assert.ok(
    bareIndex > wrapper,
    "the only bare agent( call must be the one inside budgetedAgent",
  );
});

test("the script declares D-034's caps and reads them from one place", () => {
  const caps = /const CAPS = \{([^}]*)\}/.exec(source);
  assert.ok(caps, `${SCRIPT} has no CAPS declaration`);
  assert.match(caps[1], /agents:\s*15\b/, "D-034 caps the pass at fifteen agents");
  const tokens = /tokens:\s*([0-9_]+)/.exec(caps[1]);
  assert.ok(tokens, "CAPS must declare a token cap");
  assert.ok(Number(tokens[1].replace(/_/g, "")) > 0, "the token cap must be positive");
});

/**
 * D-038, Hamza's standing ruling on F-074 clause 3: the cap stays bound in the
 * unit the script can measure, and every real pass reports that unit and the
 * Workflow tool's subagent accounting SIDE BY SIDE. The pair is the calibration
 * datum the ruling asks for; one number alone is what the two overruns already
 * produced. Static, like the two tests above, because the reporting shape is a
 * property of the shipped script rather than of a run nobody here can execute.
 */
test("the pass reports both accountings side by side (D-038)", () => {
  const spend = /spend:\s*\{([\s\S]*?)\n  \},/.exec(source);
  assert.ok(spend, `${SCRIPT} has no spend block in its return value`);
  assert.match(spend[1], /tokens_measured:/, "the measured unit must be reported");
  assert.match(
    spend[1],
    /tokens_workflow_accounting:/,
    "the Workflow tool's accounting must have a field beside the measured one, or a pass files one number and D-038's datum never exists",
  );
  assert.match(spend[1], /tokens_measured_unit:/, "the measured number must say what unit it is in");
  assert.match(source, /D-038/, `${SCRIPT} must cite the ruling it implements`);
  assert.match(
    source,
    /both accountings \(D-038\)/,
    "the operator watches a pass through its log, so the pair belongs there too",
  );
});
