#!/usr/bin/env node
/**
 * dsk CLI entry point.
 *
 * M1 STATUS: `validate` is implemented (R18, R19). `render` lands at M2 and
 * `init` at M4; both still exit 2 until then.
 *
 * Exit-code convention (D-018):
 *   0  validation ran and the tree is green ("ok": true)
 *   1  validation ran and found errors ("ok": false)
 *   2  the command is not implemented, or the CLI failed before validating
 *
 * SCHEMA.md section 5 fixes only that 0 means ok. Separating 1 from 2 is what
 * lets CI tell a real finding from a broken binary, and E2 asserts it (F-021).
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { validate } from "./validate.js";
import type { ValidateResult } from "./types.js";

const OK = 0;
const FOUND_ERRORS = 1;
const NOT_IMPLEMENTED = 2;

const USAGE =
  "dsk 0.1.0\n" +
  "usage: dsk validate [path] [--json]\n" +
  "       dsk render | init   (not implemented; M2 and M4)\n";

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
  else process.stdout.write(humanReport(result, root));
  return result.ok ? OK : FOUND_ERRORS;
}

function main(argv: string[]): number {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      options: { json: { type: "boolean", default: false } },
      allowPositionals: true,
      strict: true,
    });
  } catch (error) {
    process.stderr.write(`dsk: ${error instanceof Error ? error.message : String(error)}\n${USAGE}`);
    return NOT_IMPLEMENTED;
  }

  const command = parsed.positionals[0];
  if (command === "validate") return runValidate(parsed.positionals[1], parsed.values.json === true);

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
