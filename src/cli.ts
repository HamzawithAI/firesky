#!/usr/bin/env node
/**
 * dsk CLI entry point.
 *
 * STATUS: `validate` (R18, R19), `staleness` (R20), `render` (PROJECT.md 6.2)
 * and `status` (R12) are implemented. `init` lands at M4 and still exits 2
 * until then.
 *
 * Exit-code convention (D-018):
 *   0  validation ran and the tree is green ("ok": true)
 *   1  validation ran and found errors ("ok": false)
 *   2  the command is not implemented, or the CLI failed before validating
 *
 * SCHEMA.md section 5 fixes only that 0 means ok. Separating 1 from 2 is what
 * lets CI tell a real finding from a broken binary, and E2 asserts it (F-021).
 */
import { existsSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { parseArgs } from "node:util";
import { appendViolations } from "./git.js";
import { loadTree } from "./load.js";
import { render } from "./render.js";
import { staleness } from "./staleness.js";
import { humanStatus, status } from "./status.js";
import { validate } from "./validate.js";
import type { StalenessReport, ValidateResult } from "./types.js";

const OK = 0;
const FOUND_ERRORS = 1;
const NOT_IMPLEMENTED = 2;

const DEFAULT_STALENESS_DAYS = 30;

const USAGE =
  "dsk 0.1.0\n" +
  "usage: dsk validate   [path] [--json]\n" +
  "       dsk status     [path] [--json]\n" +
  "       dsk staleness  [path] [--json] [--window DAYS]\n" +
  "       dsk render     [path] [--out FILE]\n" +
  "       dsk init       (not implemented; M4)\n" +
  "\n" +
  "  --window   days before an entry is stale; defaults to state.yaml's\n" +
  "             staleness_days, then to " + DEFAULT_STALENESS_DAYS + " (SCHEMA.md section 4)\n" +
  "  DSK_NOW    pins the clock to an ISO date, for deterministic reports\n";

function humanReport(result: ValidateResult, root: string): string {
  const { counts } = result;
  const census = `${counts.decisions} decisions, ${counts.flags} flags, ${counts.criteria} criteria, ${counts.signoffs} sign-offs`;
  if (result.ok) return `dsk: ${root} is valid (${census}).\n`;
  const lines = result.errors.map(
    (e) => `  ${e.code}  ${e.file}:${e.line}${e.id === null ? "" : `  ${e.id}`}  ${e.message}`,
  );
  return (
    `dsk: ${result.errors.length} error${result.errors.length === 1 ? "" : "s"} in ${root} (${census}).\n` +
    lines.join("\n") +
    "\n"
  );
}

function runValidate(path: string | undefined, json: boolean): number {
  const root = resolve(path ?? ".");
  if (!existsSync(root)) {
    process.stderr.write(`dsk: no such path: ${root}\n`);
    return NOT_IMPLEMENTED;
  }
  const result = validate(root);
  if (json) process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  else {
    process.stdout.write(humanReport(result, root));
    /* An append-only check that quietly did not apply is worse than no check,
       because the run still reports success. The JSON contract is frozen at
       SCHEMA.md section 5, so this goes to stderr rather than into it (F-031). */
    if (appendViolations(root) === null) {
      process.stderr.write(
        "dsk: note, the git-level append-only check did not apply here. It needs the\n" +
          "     validated directory to be a git repository root with a parent commit.\n" +
          "     In CI, set fetch-depth: 2 on actions/checkout.\n",
      );
    }
  }
  return result.ok ? OK : FOUND_ERRORS;
}

function humanStaleness(report: StalenessReport, root: string): string {
  const { counts } = report;
  const head =
    `dsk: ${counts.stale} of ${counts.dated} dated entries are older than ${report.window_days} days ` +
    `in ${root}, as of ${report.now}` +
    (counts.undated === 0 ? ".\n" : ` (${counts.undated} entries carry no usable date).\n`);
  if (counts.stale === 0) return head;
  const rows = report.stale.map(
    (r) =>
      `  ${r.id.padEnd(7)} ${String(r.age_days).padStart(4)}d  ${r.file}:${r.line}` +
      (r.current ? "" : "  (not current)"),
  );
  const flags =
    counts.open_flags === 0
      ? ""
      : `\n  open flags past the window:\n` +
        report.open_flags.map((f) => `    ${f.id}  owner ${f.owner}  ${f.age_days}d`).join("\n") + "\n";
  return head + rows.join("\n") + "\n" + flags;
}

/**
 * The clock, injected (SCHEMA.md section 4). `DSK_NOW` wins when it is an ISO
 * date, which is what makes E4 assertable; otherwise today in UTC. `validate`
 * still reads no clock at all.
 */
function resolveNow(): string {
  const pinned = process.env["DSK_NOW"];
  if (pinned !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(pinned.slice(0, 10))) return pinned.slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function runStaleness(path: string | undefined, json: boolean, window: string | undefined): number {
  const root = resolve(path ?? ".");
  if (!existsSync(root)) {
    process.stderr.write(`dsk: no such path: ${root}\n`);
    return NOT_IMPLEMENTED;
  }
  const tree = loadTree(root, null); // R20 reads content only; no git check needed
  let windowDays: number;
  if (window === undefined) {
    windowDays = tree.stateYaml.stalenessDays ?? DEFAULT_STALENESS_DAYS;
  } else {
    windowDays = Number(window);
    if (!Number.isInteger(windowDays) || windowDays < 0) {
      process.stderr.write(`dsk: --window must be a whole number of days, got '${window}'\n`);
      return NOT_IMPLEMENTED;
    }
  }
  const report = staleness(tree, resolveNow(), windowDays);
  if (json) process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  else process.stdout.write(humanStaleness(report, root));
  // A report, not a gate: exit 0 whenever it ran (F-046).
  return OK;
}

/**
 * `dsk status` (R12). Clock-free and git-free: every answer is derived from
 * pointers, so there is nothing here for a clock or a parent commit to change.
 * It reports state, never validity — `dsk validate` owns that, and keeping them
 * apart is what keeps validate's exit codes meaning valid and invalid only
 * (D-018, F-046).
 */
function runStatus(path: string | undefined, json: boolean): number {
  const root = resolve(path ?? ".");
  if (!existsSync(root)) {
    process.stderr.write(`dsk: no such path: ${root}\n`);
    return NOT_IMPLEMENTED;
  }
  const report = status(loadTree(root, null));
  if (json) process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  else process.stdout.write(humanStatus(report, root));
  // A census, not a gate: exit 0 whenever it ran, for the same reason staleness
  // does. A tree with warnings in it is not an invalid tree (M2-REVIEW 2.2).
  return OK;
}

function runRender(path: string | undefined, out: string | undefined): number {
  const root = resolve(path ?? ".");
  if (!existsSync(root)) {
    process.stderr.write(`dsk: no such path: ${root}\n`);
    return NOT_IMPLEMENTED;
  }
  const tree = loadTree(root, appendViolations(root));
  const html = render(tree, basename(root) || "dsk");
  if (out === undefined) process.stdout.write(html + "\n");
  else {
    writeFileSync(resolve(out), html + "\n");
    process.stderr.write(`dsk: wrote ${resolve(out)}\n`);
  }
  return OK;
}

function main(argv: string[]): number {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      options: {
        json: { type: "boolean", default: false },
        window: { type: "string" },
        out: { type: "string" },
      },
      allowPositionals: true,
      strict: true,
    });
  } catch (error) {
    process.stderr.write(`dsk: ${error instanceof Error ? error.message : String(error)}\n${USAGE}`);
    return NOT_IMPLEMENTED;
  }

  const command = parsed.positionals[0];
  if (parsed.positionals.length > 2) {
    process.stderr.write(`dsk: '${command}' takes at most one path\n${USAGE}`);
    return NOT_IMPLEMENTED;
  }
  if (command === "validate") return runValidate(parsed.positionals[1], parsed.values.json === true);
  if (command === "staleness")
    return runStaleness(parsed.positionals[1], parsed.values.json === true, parsed.values.window);
  if (command === "status") return runStatus(parsed.positionals[1], parsed.values.json === true);
  if (command === "render") return runRender(parsed.positionals[1], parsed.values.out);

  if (command === undefined || command === "help") {
    process.stderr.write(USAGE);
    return NOT_IMPLEMENTED;
  }
  process.stderr.write(
    `dsk: '${command}' is not implemented (exit ${NOT_IMPLEMENTED}). See PLAN.md.\n${USAGE}`,
  );
  return NOT_IMPLEMENTED;
}

process.exitCode = main(process.argv.slice(2));
