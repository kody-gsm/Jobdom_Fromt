import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "app/(auth)/signup/page.tsx"),
  "utf8",
);

assert.match(source, /<span className="mt-\[12px\] w-\[600px\]/);
assert.match(source, /className="mt-\[8px\] h-\[56px\] w-\[600px\]/);
assert.match(source, /mb-\[64px\] mt-\[28px\]/);
assert.doesNotMatch(source, /<span className="mt-\[20px\] w-\[600px\]/);
assert.doesNotMatch(source, /className="mt-\[16px\] h-\[56px\] w-\[600px\]/);

console.log("signup spacing contract passed");
