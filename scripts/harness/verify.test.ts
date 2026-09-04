import assert from "node:assert/strict";
import { getVerificationSteps } from "./verify.ts";

assert.deepEqual(
  getVerificationSteps().map((step) => step.name),
  [
    "harness config",
    "preflight unit",
    "changed lint unit",
    "fsd boundary unit",
    "convention unit",
    "branch cleanup unit",
    "lightweight harness unit",
    "verify unit",
    "lint",
    "fsd boundary check",
    "convention check",
    "build",
  ],
);
