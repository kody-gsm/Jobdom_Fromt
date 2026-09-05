import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { getVerificationSteps } from "./verify.ts";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const names = getVerificationSteps().map((step) => step.name);

assert.equal(packageJson.scripts["harness:scope"], undefined);
assert.equal(existsSync("scripts/harness/changed-files-check.ts"), false);
assert.equal(existsSync("scripts/harness/changed-files-check.test.ts"), false);
assert.equal(existsSync("docs/harness/REFACTORING_RULES.md"), false);
assert.equal(existsSync("docs/harness/FUNCTION_RULES.md"), false);
assert.equal(existsSync(".harness/sync.yml"), false);
assert.ok(existsSync("docs/ARCHITECTURE.md"));
assert.ok(existsSync("docs/contracts/API_CONTRACT.md"));
assert.ok(existsSync("scripts/harness/contract-check.ts"));
assert.ok(existsSync("scripts/harness/diff-check.ts"));
assert.ok(existsSync("scripts/harness/readiness.ts"));
assert.ok(packageJson.scripts["harness:contracts"]);
assert.ok(packageJson.scripts["harness:diff"]);
assert.ok(packageJson.scripts["harness:ready"]);
assert.deepEqual(names, [
  "harness config",
  "preflight unit",
  "changed lint unit",
  "contract check unit",
  "diff check unit",
  "fsd boundary unit",
  "convention unit",
  "branch cleanup unit",
  "readiness unit",
  "lightweight harness unit",
  "verify unit",
  "contracts",
  "lint",
  "fsd boundary check",
  "convention check",
  "diff check",
  "build",
]);
