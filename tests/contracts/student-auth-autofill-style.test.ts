import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync("src/fsd/widgets/auth-layout/ui/AuthLayout.tsx", "utf8");
const css = readFileSync("app/globals.css", "utf8");

assert.match(layout, /student-auth/);
assert.doesNotMatch(layout, /style=\{\{[^}]*fontFamily/);
assert.match(css, /--font-sans:\s*"Pretendard Variable"/);
assert.match(css, /\.student-auth input:-webkit-autofill/);
assert.match(css, /-webkit-text-fill-color:\s*#202124/);
assert.match(css, /font-family:\s*inherit/);
assert.match(css, /font-size:\s*1rem\s*!important/);
assert.doesNotMatch(css, /-webkit-box-shadow|box-shadow:\s*0 0 0 1000px #fff inset/);
assert.doesNotMatch(css, /body\s*\{[\s\S]*?font-family:\s*"Pretendard Variable"/);

console.log("student auth autofill style contract passed");