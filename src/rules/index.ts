/**
 * The rule registry (D-011): one module per error code, listed in the order of
 * SCHEMA.md section 6. Adding a code here without its fixture pair is a D-011
 * violation, and the eval runner's inventory check catches it.
 */
import { rule as owner } from "./owner.js";
import { rule as dupId } from "./dup-id.js";
import { rule as status } from "./status.js";
import { rule as staleRef } from "./stale-ref.js";
import { rule as link } from "./link.js";
import { rule as provenance } from "./provenance.js";
import { rule as modelId } from "./model-id.js";
import { rule as signoffMutation } from "./signoff-mutation.js";
import { rule as resolution } from "./resolution.js";
import { rule as idGrammar } from "./id-grammar.js";
import { rule as schemaVersion } from "./schema-version.js";
import { rule as date } from "./date.js";
import { rule as inplaceEdit } from "./inplace-edit.js";
import { rule as rationale } from "./rationale.js";
import { rule as scope } from "./scope.js";
import { rule as dupKey } from "./dup-key.js";
import type { Rule } from "../types.js";

export const RULES: readonly Rule[] = [
  owner,
  dupId,
  status,
  staleRef,
  link,
  provenance,
  modelId,
  signoffMutation,
  resolution,
  idGrammar,
  schemaVersion,
  date,
  inplaceEdit,
  rationale,
  scope,
  dupKey,
];
