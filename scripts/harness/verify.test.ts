import assert from "node:assert/strict";
import { classifyStepResult, getVerificationSteps, resolveStepTimeoutMs } from "./verify.ts";

assert.deepEqual(
  getVerificationSteps().map((step) => step.name),
  [
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
  ],
);

assert.equal(resolveStepTimeoutMs(undefined), 600_000);
assert.equal(resolveStepTimeoutMs("2500"), 2500);
assert.equal(resolveStepTimeoutMs("0"), 600_000);
assert.equal(classifyStepResult({ status: 0 }), "ok");
assert.equal(classifyStepResult({ status: 1 }), "failed");
assert.equal(classifyStepResult({ status: null, errorCode: "ETIMEDOUT" }), "timeout");
