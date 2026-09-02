import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "app/(auth)/signup/page.tsx"),
  "utf8",
);

assert.match(source, /<Field first label="이메일"/);
assert.match(source, /first \? "mt-\[88px\]" : "mt-\[12px\]"/);
assert.match(source, /className="mt-\[8px\] h-\[56px\] w-\[600px\]/);
assert.match(source, /mb-\[64px\] mt-\[28px\]/);

console.log("signup spacing contract passed");
