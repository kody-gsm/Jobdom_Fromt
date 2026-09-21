import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "src/fsd/entities/user/model/lifecycle.ts"),
  "utf8",
);
const restore = source.match(
  /export const restoreRememberedSession = async \(\) => \{([\s\S]*?)\n\};/,
)?.[1] || "";

assert.match(restore, /const active = getSession\(\)/);
assert.match(restore, /return active && !isAccessTokenExpired\(active\.accessToken\) \? active : null/);
assert.doesNotMatch(restore, /reissueSession\(/);
assert.doesNotMatch(restore, /clearRememberedSession\(/);

console.log("remember login restore contract passed");
