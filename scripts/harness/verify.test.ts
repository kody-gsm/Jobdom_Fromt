import assert from "node:assert/strict";
import { getVerificationSteps } from "./verify.ts";

const steps = getVerificationSteps([
  "api-contract-check.ts",
  "form-answers-check.ts",
  "auth-route-guard-check.ts",
]);
const names = steps.map((step) => step.name);

assert.deepEqual(names.slice(0, 12), [
  "harness config",
  "preflight unit",
  "scope unit",
  "changed lint unit",
  "fsd boundary unit",
  "convention unit",
  "shared api unit",
  "lint",
  "fsd boundary check",
  "convention check",
  "api contract",
  "form contract",
]);
assert.ok(names.includes("regression: auth-route-guard-check.ts"));
assert.ok(names.includes("scope check"));
assert.equal(names.at(-1), "build");
assert.equal(names.filter((name) => name.includes("api-contract-check")).length, 0);
