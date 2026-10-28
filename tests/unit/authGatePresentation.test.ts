import assert from "node:assert/strict";
import { shouldRenderAuthChildren } from "../../src/fsd/app/auth-gate/model/authGatePresentation.ts";

assert.equal(shouldRenderAuthChildren("checking"), true);
assert.equal(shouldRenderAuthChildren("allowed"), true);
assert.equal(shouldRenderAuthChildren("redirecting"), false);

console.log("auth gate presentation tests passed");
