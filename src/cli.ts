#!/usr/bin/env node
/**
 * dsk CLI entry point.
 *
 * M0 STATUS: STUB ONLY. No validation logic exists yet and none may be added
 * in this milestone (PLAN.md M0.4, EVALS.md section 1.1: fixtures and expected
 * outputs exist and fail before feature code exists).
 *
 * Every subcommand exits 2 (NOT IMPLEMENTED). The eval runner reads exit 2 as
 * a red result, which is exactly what the M0 gate requires. R18 and R19 land
 * in M1, R20 and R22 in M2.
 *
 * Exit-code convention (D-018):
 *   0  validation ran and the tree is green ("ok": true)
 *   1  validation ran and found errors ("ok": false)
 *   2  the command is not implemented, or the CLI failed before validating
 */
import { parseArgs } from "node:util";

const NOT_IMPLEMENTED = 2;

const KNOWN_COMMANDS = ["validate", "render", "init"] as const;

function main(argv: string[]): number {
  const { positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: false,
  });

  const command = positionals[0];

  if (command === undefined || command === "help") {
    process.stderr.write(
      "dsk 0.1.0 (M0 scaffold)\n" +
        `usage: dsk <${KNOWN_COMMANDS.join("|")}> [--json] [path]\n` +
        "No subcommand is implemented yet; the validator lands in M1.\n",
    );
    return NOT_IMPLEMENTED;
  }

  process.stderr.write(
    `dsk: '${command}' is not implemented (M0 scaffold, exit ${NOT_IMPLEMENTED}).\n` +
      "The M0 gate requires every fixture to report red. See PLAN.md M1.\n",
  );
  return NOT_IMPLEMENTED;
}

process.exitCode = main(process.argv.slice(2));
