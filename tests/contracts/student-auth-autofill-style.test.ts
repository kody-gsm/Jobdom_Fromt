import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync("src/fsd/widgets/auth-layout/ui/AuthLayout.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

assert.match(layout, /student-auth/);
assert.match(layout, /Pretendard Variable/);
assert.match(css, /\.student-auth input:-webkit-autofill/);
assert.match(css, /-webkit-text-fill-color:\s*#202124/);
assert.match(css, /font-family:\s*inherit/);
assert.match(css, /-webkit-box-shadow:\s*0 0 0 1000px #fff inset/);
assert.doesNotMatch(css, /body\s*\{[^}]*Pretendard/s);

console.log("student auth autofill style contract passed");
