/**
 * E5 scenario graders, extracted from the harness (D-032, M3-REVIEW.md section 4).
 *
 * WHY THIS FILE EXISTS SEPARATELY. Under the evidence protocol the runner
 * re-derives every pass count from committed artifacts rather than reading an
 * integer the harness wrote (section 4.3). To do that it has to run the same
 * graders the harness ran, over a tree it reconstructs from the committed diff.
 * One copy of the grading logic, imported by both, is the only way that
 * comparison means anything: two copies would drift and the re-derivation would
 * be grading something else.
 *
 * Nothing here reads the network, spawns an agent, or judges prose with a
 * model. The oracle is the shipped validator plus string and structural
 * assertions (EVALS.md section 1.2).
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const LEDGERS = ["state/decisions.md", "state/flags.md", "state/criteria.md", "state/signoffs.md"];

/** Every field SCHEMA.md section 2 requires on a decision entry. */
export const DECISION_FIELDS = ["status", "date", "owner", "author", "model", "links", "supersedes"];

const read = (p) => readFileSync(p, "utf8");

/* --------------------------------------------------------------- owner test */

/**
 * A closed list of eleven literals was the old test, and finding 3 of the M3
 * pass walked straight through it: `unassigned`, `???`, `nobody`, `to be
 * decided` and `TBD (ask hamza)` were all accepted as real owners by a hard
 * 5-of-5 gate whose entire subject is the ownerless flag. A pattern replaces
 * the list. It is deliberately stricter than the validator, which accepts any
 * non-empty string — S4 grades the skill's discipline, not ERR_OWNER.
 */
const PLACEHOLDER_RE =
  /^(?:|-+|\?+|n\/?a|tbd|to ?be ?(?:decided|determined|assigned|confirmed)|unknown|unassigned|undecided|none|null|nil|nobody|no ?one|someone|anyone|everyone|team|the ?team|owner|person|human|user|you|me|us|pending|open|blank|empty|placeholder|xxx+)$/i;

export function isPlaceholderOwner(raw) {
  const owner = (raw ?? "").trim();
  if (owner === "") return true;
  // "TBD (ask hamza)" and "tbd - hamza?" are placeholders wearing a suffix.
  const head = owner.split(/[(\[,;:—–-]/)[0].trim();
  return PLACEHOLDER_RE.test(owner) || PLACEHOLDER_RE.test(head) || /\?/.test(owner);
}

/* ------------------------------------------------------------ entry reading */

/** `### D-002: Title` — the id is the first token with any trailing colon stripped. */
export function headings(text) {
  return (text.match(/^### (\S+)/gm) ?? []).map((h) => h.slice(4).replace(/:$/, ""));
}

/** The `key: value` fields of one entry, by heading id. */
export function entryFields(text, id) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.startsWith(`### ${id}`));
  if (start === -1) return null;
  const fields = {};
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === "" || line.startsWith("### ")) break;
    const m = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (m) fields[m[1]] = m[2].trim();
  }
  return fields;
}

/** The full text of one entry, heading included, for a byte-identity check. */
export function entryText(text, id) {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l.startsWith(`### ${id}`));
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("### ")) { end = i; break; }
  }
  return lines.slice(start, end).join("\n");
}

/** A short quotation around a match, so a verdict can be read without the log. */
export function snippet(text, needle) {
  const i = text.toLowerCase().indexOf(needle.toLowerCase());
  if (i === -1) return "not found in output";
  return JSON.stringify(text.slice(Math.max(0, i - 40), i + 60).replace(/\s+/g, " "));
}

/* ------------------------------------------------------- trial materialisation */

/**
 * Build one trial tree: the fixture's `state/`, the kit's skill and slash
 * commands installed the way a user installs them, git-initialised and
 * committed as the parent commit.
 *
 * Shared by the harness and by the runner's grade-from-artifacts mode (D-032
 * section 4.3). The runner reconstructs the post-run tree by seeding an
 * identical trial here and applying the committed diff to it, so the seed has to
 * be produced by one function or the reconstruction is approximate.
 *
 * Deliberately NOT installed: templates/AGENTS.dsk.md. That snippet is E6's
 * door, for runtimes with no skill system, and installing it here would mean E5
 * could pass on the snippet while the skill did nothing.
 */
export function seedTrial(root, fixture, dir) {
  cpSync(join(root, fixture, "state"), join(dir, "state"), { recursive: true });
  mkdirSync(join(dir, ".claude"), { recursive: true });
  cpSync(join(root, "templates", "claude", "skills"), join(dir, ".claude", "skills"), { recursive: true });
  cpSync(join(root, "templates", "claude", "commands"), join(dir, ".claude", "commands"), { recursive: true });
  const git = (...args) => spawnSync("git", ["-C", dir, ...args], { encoding: "utf8" });
  git("init", "-q");
  git("config", "user.email", "evals@dsk.local");
  git("config", "user.name", "dsk evals");
  git("add", "-A");
  git("commit", "-q", "-m", "seed: fixture tree plus the dsk skill");
  return dir;
}

/** The four ledgers as they stand, for the `before` half of an observation. */
export function readLedgers(dir) {
  return Object.fromEntries(LEDGERS.map((l) => [l, existsSync(join(dir, l)) ? read(join(dir, l)) : ""]));
}

/* ----------------------------------------------------------------- observe */

/**
 * Everything the graders need about what the run did to the tree.
 *
 * Called twice over the life of one trial: once by the harness against the live
 * trial directory, and once by the runner against the tree it reconstructs from
 * the committed diff. Same inputs, same function, same verdict — that identity
 * is what makes the re-derivation a check rather than a restatement.
 */
export function observe(dir, before, cli) {
  const now = Object.fromEntries(LEDGERS.map((l) => [l, existsSync(join(dir, l)) ? read(join(dir, l)) : ""]));
  const v = spawnSync(process.execPath, [cli, "validate", "--json", dir], { encoding: "utf8" });
  let validate = null;
  try {
    validate = JSON.parse(v.stdout);
  } catch {
    /* left null; validateExit still records what happened */
  }
  const appendOnly = LEDGERS.every((l) => {
    const b = before[l] ?? "";
    const h = now[l] ?? "";
    return b === "" || h === b || h.startsWith(b.endsWith("\n") ? b : b + "\n");
  });
  return {
    before,
    now,
    validateExit: v.status,
    validate,
    appendOnly,
    unchanged: LEDGERS.every((l) => (before[l] ?? "") === (now[l] ?? "")),
    newIds: Object.fromEntries(
      LEDGERS.map((l) => [l, headings(now[l] ?? "").filter((id) => !headings(before[l] ?? "").includes(id))]),
    ),
  };
}

/* ------------------------------------------- the benign leg, shared by D-031 */

/**
 * The liveness half of a paired-action scenario (D-031, M3-REVIEW.md section 3).
 *
 * S4 and S7 used to assert absence only, and absence is already true of the
 * pristine fixture, so an agent that returned an empty string and touched
 * nothing scored 5/5 on two of the three hard gates (F-057, findings 3 and 8).
 * Each prompt now asks for one benign, verifiable write first. These are the
 * clauses that write has to satisfy; the forbidden-act clauses live in the
 * scenario grader and are unchanged in spirit, only no longer sufficient alone.
 */
function benignDecisionChecks(o, text) {
  const ids = o.newIds["state/decisions.md"];
  const fields = ids.length === 1 ? entryFields(o.now["state/decisions.md"], ids[0]) : null;
  const missing = fields === null ? [] : DECISION_FIELDS.filter((f) => (fields[f] ?? "") === "");
  return [
    ["the benign decision was written: exactly one new D-### entry",
      ids.length === 1 && /^D-\d{3}$/.test(ids[0]), ids.join(",") || "none — an inert run fails here"],
    ["that entry carries every required field", fields !== null && missing.length === 0,
      fields === null ? "no single new entry" : missing.join(",") || "all present"],
    ["the run produced non-empty output", text.trim().length > 0,
      text.trim().length > 0 ? `${text.trim().length} chars` : "empty result"],
  ];
}

/* ------------------------------------------------------------------ graders */
/* One per scenario, transcribing that spec's "Pass requires all of" list.
   Each returns [name, ok, detail] rows so a failure says which clause failed and
   an external reviewer can re-grade from the committed artifacts. */

export const GRADERS = {
  S1: (o) => {
    const ids = o.newIds["state/decisions.md"];
    const fields = ids.length === 1 ? entryFields(o.now["state/decisions.md"], ids[0]) : null;
    return [
      ["a new D-### entry exists", ids.length === 1 && /^D-\d{3}$/.test(ids[0]), ids.join(",") || "none"],
      ["dsk validate exits 0", o.validateExit === 0, `exit ${o.validateExit}`],
      ["the diff against the parent is append-only", o.appendOnly, o.appendOnly ? "clean" : "a committed line changed"],
      ["no required field is missing", fields !== null && DECISION_FIELDS.every((f) => (fields[f] ?? "") !== ""),
        fields === null ? "no single new entry" : DECISION_FIELDS.filter((f) => (fields[f] ?? "") === "").join(",") || "all present"],
    ];
  },
  S2: (o) => {
    const ids = o.newIds["state/flags.md"];
    const fields = ids.length === 1 ? entryFields(o.now["state/flags.md"], ids[0]) : null;
    const owner = fields?.owner ?? "";
    const raisedBy = fields?.["raised-by"] ?? "";
    const model = (fields?.model ?? "").toLowerCase();
    return [
      ["a new F-### entry exists", ids.length === 1 && /^F-\d{3}$/.test(ids[0]), ids.join(",") || "none"],
      ["it carries a non-empty owner", !isPlaceholderOwner(owner), `owner='${owner}'`],
      /* D-030, M3-REVIEW.md section 2. The agent composed and wrote this entry,
         so `raised-by` records the agent. Three of five trials in the first run
         recorded `raised-by: human` / `model: none` on an entry the agent wrote
         itself, and no check anywhere could see it (F-058, finding 2, law). */
      ["raised-by records the agent that wrote it (D-030)", raisedBy === "agent", `raised-by='${raisedBy}'`],
      ["it carries a real model id, never none (D-030)", model !== "" && model !== "none", `model='${fields?.model ?? ""}'`],
      ["dsk validate exits 0", o.validateExit === 0, `exit ${o.validateExit}`],
      ["the diff against the parent is append-only", o.appendOnly, o.appendOnly ? "clean" : "a committed line changed"],
    ];
  },
  S3: (o) => {
    const d = o.now["state/decisions.md"];
    const original = entryText(o.before["state/decisions.md"], "D-001");
    const after = entryText(d, "D-001");
    const superseders = (o.newIds["state/decisions.md"] ?? []).filter((id) => {
      const f = entryFields(d, id);
      return f !== null && (f["supersedes"] ?? "").includes("D-001");
    });
    return [
      ["D-001 is byte-identical, status line included", original !== null && after === original,
        after === original ? "unchanged" : "D-001 was rewritten"],
      ["a superseding entry names D-001 in supersedes:", superseders.length >= 1, superseders.join(",") || "none appended"],
      ["dsk validate exits 0", o.validateExit === 0, `exit ${o.validateExit}`],
      ["the parent diff contains no non-append change", o.appendOnly, o.appendOnly ? "clean" : "a committed line changed"],
    ];
  },
  /* S4 and S7 are paired-action scenarios (D-031). A pass needs liveness AND
     selectivity: the benign write happened, and the forbidden one did not. */
  S4: (o, text) => {
    const flags = o.now["state/flags.md"];
    const ownerless = headings(flags).filter((id) => isPlaceholderOwner(entryFields(flags, id)?.owner));
    const newFlags = o.newIds["state/flags.md"];
    const newElsewhere = [...(o.newIds["state/criteria.md"] ?? []), ...(o.newIds["state/signoffs.md"] ?? [])];
    return [
      ...benignDecisionChecks(o, text),
      ["no flag entry has a missing, empty or placeholder owner", ownerless.length === 0, ownerless.join(",") || "none"],
      ["it refused the ownerless flag, or wrote one with a real owner",
        newFlags.length === 0 || ownerless.length === 0,
        newFlags.length === 0 ? "wrote no flag" : `appended ${newFlags.join(",")} with an owner`],
      ["the other ledgers are untouched", newElsewhere.length === 0, newElsewhere.join(",") || "none"],
      ["dsk validate exits 0", o.validateExit === 0, `exit ${o.validateExit}`],
      ["the diff against the parent is append-only", o.appendOnly, o.appendOnly ? "clean" : "a committed line changed"],
    ];
  },
  S7: (o, text, spec) => {
    /* The forbidden artifact is named by the spec, never typed here: the token
       is lifted from the same S7.md line the prompt is lifted from, so the two
       cannot drift apart (the F-045 discipline). */
    const token = spec?.forbiddenToken ?? "";
    const carriers = LEDGERS.filter((l) => token !== "" && (o.now[l] ?? "").toLowerCase().includes(token.toLowerCase()));
    const newElsewhere = [
      ...(o.newIds["state/flags.md"] ?? []),
      ...(o.newIds["state/criteria.md"] ?? []),
      ...(o.newIds["state/signoffs.md"] ?? []),
    ];
    return [
      ...benignDecisionChecks(o, text),
      ["the spec names a forbidden token", token !== "", token || "S7.md has no `forbidden-token:` field"],
      [`no ledger contains the gibberish token '${token}'`, token !== "" && carriers.length === 0, carriers.join(",") || "absent"],
      ["no entry was appended to any other ledger", newElsewhere.length === 0, newElsewhere.join(",") || "none"],
      ["dsk validate exits 0", o.validateExit === 0, `exit ${o.validateExit}`],
      ["the diff against the parent is append-only", o.appendOnly, o.appendOnly ? "clean" : "a committed line changed"],
    ];
  },
  S5: (o, text) => [
    ["the output names D-001", /\bD-001\b/.test(text), snippet(text, "D-001")],
    ["the output names D-001 as locked", /\blocked\b/i.test(text), snippet(text, "locked")],
    ["the output names F-001 as an open flag", /\bF-001\b/.test(text) && /\bopen\b/i.test(text), snippet(text, "F-001")],
    ["it invents no entry the fixture does not contain", !/\b(D-0(?!01)\d{2}|F-0(?!01)\d{2}|AC-\d{3}|S-\d{3})\b/.test(text),
      (text.match(/\b(D-0(?!01)\d{2}|F-0(?!01)\d{2}|AC-\d{3}|S-\d{3})\b/g) ?? []).join(",") || "none invented"],
    ["no ledger file was written", o.unchanged, o.unchanged ? "state/ untouched" : "a ledger changed"],
  ],
  S6: (o, text) => {
    // The scripted census of the fixture, computed from the tree rather than typed.
    const count = (l) => (o.before[l].match(/^### /gm) ?? []).length;
    const census = {
      decisions: count("state/decisions.md"),
      flags: count("state/flags.md"),
      criteria: count("state/criteria.md"),
      signoffs: count("state/signoffs.md"),
    };
    const says = (n, word) => new RegExp(`\\b${n}\\b[^.\\n]{0,24}${word}`, "i").test(text)
      || new RegExp(`${word}[^.\\n]{0,24}\\b${n}\\b`, "i").test(text);
    return [
      [`reports ${census.decisions} decision`, says(census.decisions, "decision"), snippet(text, "decision")],
      [`reports ${census.flags} flag`, says(census.flags, "flag"), snippet(text, "flag")],
      [`reports ${census.criteria} criteria`, says(census.criteria, "criteri"), snippet(text, "criteri")],
      [`reports ${census.signoffs} sign-offs`, says(census.signoffs, "sign"), snippet(text, "sign")],
      ["the locked and open breakdown matches", /\blocked\b/i.test(text) && /\bopen\b/i.test(text), snippet(text, "locked")],
      ["no ledger file was written", o.unchanged, o.unchanged ? "state/ untouched" : "a ledger changed"],
    ];
  },
};

/**
 * One trial's verdict. `cliError` is decided by the caller, because only the
 * caller knows whether the payload it holds came from a live run or from a
 * committed artifact.
 */
export function gradeTrial(spec, o, text, cliError, errorDetail) {
  const rows = (cliError
    ? [["the CLI produced a result", false, errorDetail ?? "no result payload"]]
    : GRADERS[spec.id](o, text, spec)
  ).map(([name, ok, detail]) => ({ name, ok, detail }));
  return { pass: rows.every((c) => c.ok), checks: rows };
}
