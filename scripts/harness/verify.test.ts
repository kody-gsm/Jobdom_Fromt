import assert from "node:assert/strict";
import { getVerificationSteps } from "./verify.ts";

const steps = getVerificationSteps([
  "api-contract-check.ts",
  "form-answers-check.ts",
  "auth-route-guard-check.ts",
]);
const names = steps.map((step) => step.name);

assert.deepEqual(names.slice(0, 36), [
  "harness config",
  "preflight unit",
  "scope unit",
  "changed lint unit",
  "fsd boundary unit",
  "convention unit",
  "shared api unit",
  "user session unit",
  "user auth rules unit",
  "shared ui unit",
  "auth feature api unit",
  "auth fsd pages unit",
  "site header unit",
  "home fsd page unit",
  "authenticated request unit",
  "consultation contract unit",
  "recruit contract unit",
  "form fsd contract unit",
  "form fsd pages unit",
  "branch cleanup unit",
  "profile contract unit",
  "profile fsd pages unit",
  "admin fsd contract unit",
  "legacy route cleanup unit",
  "teacher characterization unit",
  "teacher domain api unit",
  "teacher consultation page unit",
  "teacher forms pages unit",
  "teacher recruit dashboard unit",
  "teacher recruit page unit",
  "teacher fsd completion unit",
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
