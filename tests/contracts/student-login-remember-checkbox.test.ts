import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const loginForm = readFileSync(
  resolve(process.cwd(), "src/fsd/features/login/ui/LoginForm.tsx"),
  "utf8",
);
const rememberControl = loginForm.match(/<label className="flex min-h-11[\s\S]*?<\/label>/)?.[0] ?? "";

assert.match(rememberControl, /appearance-none/);
assert.match(rememberControl, /checked:bg-\[#02C551\]/);
assert.match(rememberControl, /checked:border-\[#02C551\]/);
assert.match(rememberControl, /<svg[\s\S]*viewBox="0 0 12 10"/);
assert.match(rememberControl, /<path[\s\S]*stroke="currentColor"/);
assert.doesNotMatch(rememberControl, />✓<\/span>/);
assert.doesNotMatch(rememberControl, /accent-\[|hover:/);

console.log("student login remember checkbox contract passed");
