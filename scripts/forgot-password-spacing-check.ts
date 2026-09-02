import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "app/(auth)/forgot-password/page.tsx"),
  "utf8",
);

assert.match(source, /style=\{\{ marginTop: 88 \}\}/);
assert.match(source, /className="mt-\[8px\] py-\[16px\] px-\[16px\] w-\[600px\] h-\[56px\]"/);
assert.match(source, /className="mt-\[12px\] text-left w-\[600px\]/);
assert.match(source, /mt-\[28px\]/);
assert.match(source, /mb-\[64px\]/);
assert.doesNotMatch(source, /className="mt-\[88px\] text-left w-\[600px\]/);

console.log("forgot password spacing contract passed");
