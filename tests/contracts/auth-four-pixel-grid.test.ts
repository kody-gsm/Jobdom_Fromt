import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync("src/fsd/widgets/auth-layout/ui/AuthLayout.tsx", "utf8");
const login = readFileSync("src/fsd/features/login/ui/LoginForm.tsx", "utf8");

assert.doesNotMatch(layout, /height=\{67\}|max-w-\[390px\]|0_18px_50px/);
assert.match(layout, /height=\{68\}/);
assert.match(layout, /max-w-\[392px\]/);
assert.match(layout, /shadow-\[0_20px_52px_/);

assert.doesNotMatch(login, /rounded-\[14px\]|gap-2\.5|h-2\.5/);
assert.match(login, /rounded-2xl/);
assert.match(login, /gap-3/);
assert.match(login, /className="pointer-events-none relative h-3 w-3 text-white"/);

console.log("auth four-pixel grid contract passed");
