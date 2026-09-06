import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync("src/fsd/widgets/auth-layout/ui/AuthLayout.tsx", "utf8");
const loginPage = readFileSync("src/fsd/pages/login/ui/LoginPage.tsx", "utf8");
const signupPage = readFileSync("src/fsd/pages/signup/ui/SignupPage.tsx", "utf8");
const resetPage = readFileSync("src/fsd/pages/forgot-password/ui/ForgotPasswordPage.tsx", "utf8");

assert.match(layout, /JobdamIcon\.svg/);
assert.match(layout, /bg-\[#F4F6F5\]/);
assert.match(layout, /bg-white/);
assert.match(layout, /max-w-\[520px\]/);
assert.doesNotMatch(layout, /brightness-0 invert/);
assert.doesNotMatch(layout, /bg-\[#0F1F2D\]/);
assert.doesNotMatch(layout, /취업과 상담을 한 곳에서/);
assert.doesNotMatch(layout, /Gwangju Software Meister High School/);
assert.doesNotMatch(loginPage, /다시 만나서 반가워요/);
assert.doesNotMatch(loginPage, /학교 계정으로 로그인하고/);
assert.match(signupPage, /잡담 계정을 만들어보세요/);
assert.match(resetPage, /비밀번호/);
assert.doesNotMatch(`${layout}\n${loginPage}\n${signupPage}\n${resetPage}`, /\/teacher|\/admin/);

console.log("student auth layout cleanup contract passed");
