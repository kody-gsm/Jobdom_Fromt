import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layoutPath = "src/fsd/widgets/auth-layout/ui/AuthLayout.tsx";
const loginPagePath = "src/fsd/pages/login/ui/LoginPage.tsx";
const signupPagePath = "src/fsd/pages/signup/ui/SignupPage.tsx";
const resetPagePath = "src/fsd/pages/forgot-password/ui/ForgotPasswordPage.tsx";

const layout = readFileSync(layoutPath, "utf8");
const loginPage = readFileSync(loginPagePath, "utf8");
const signupPage = readFileSync(signupPagePath, "utf8");
const resetPage = readFileSync(resetPagePath, "utf8");

assert.match(layout, /bg-\[#0F1F2D\]/);
assert.match(layout, /bg-\[#F4F6F5\]/);
assert.match(layout, /bg-white/);
assert.match(layout, /JobdamIcon\.svg/);
assert.match(layout, /취업과 상담을 한 곳에서/);
assert.match(layout, /max-w-\[520px\]/);
assert.match(loginPage, /다시 만나서 반가워요/);
assert.match(signupPage, /잡담 계정을 만들어보세요/);
assert.match(resetPage, /비밀번호를 다시 설정해요/);
assert.doesNotMatch(`${layout}\n${loginPage}\n${signupPage}\n${resetPage}`, /\/teacher|\/admin/);

console.log("student auth layout redesign contract passed");