import assert from "node:assert/strict";
import { evaluateReadiness } from "./readiness.ts";

assert.deepEqual(evaluateReadiness({ branch: "fix/mobile", statusLines: [], aheadCount: 1 }).errors, []);
assert.equal(evaluateReadiness({ branch: "develop", statusLines: [], aheadCount: 1 }).errors.length, 1);
assert.equal(evaluateReadiness({ branch: "fix/mobile", statusLines: [" M file.ts"], aheadCount: 1 }).errors.length, 1);
assert.equal(evaluateReadiness({ branch: "fix/mobile", statusLines: [], aheadCount: 0 }).errors.length, 1);
