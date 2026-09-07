/**
 * ERR_SCHEMA_VERSION — SCHEMA.md section 4. A whole-file error: no entry
 * carries it, so `id` is null and `line` is 1 (F-008). Fixture: INV-12.
 */
import { STATE_YAML } from "../load.js";
import type { DskError, Rule } from "../types.js";

export const rule: Rule = {
  code: "ERR_SCHEMA_VERSION",
  run(tree) {
    if (tree.stateYaml.present && tree.stateYaml.keys.has("schema")) return [];
    const error: DskError = {
      code: "ERR_SCHEMA_VERSION",
      file: STATE_YAML,
      id: null,
      line: 1,
      message: tree.stateYaml.present ? "state.yaml has no schema version" : "state.yaml is missing",
    };
    return [error];
  },
};
