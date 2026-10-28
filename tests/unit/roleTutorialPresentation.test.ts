import assert from "node:assert/strict";
import { shouldRenderTutorialChildren } from "../../src/fsd/features/role-tutorial/model/presentation.ts";

assert.equal(shouldRenderTutorialChildren("loading"), true);
assert.equal(shouldRenderTutorialChildren("completed"), true);
assert.equal(shouldRenderTutorialChildren("tutorial"), false);

console.log("role tutorial presentation tests passed");
