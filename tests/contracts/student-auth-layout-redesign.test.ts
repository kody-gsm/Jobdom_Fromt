import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync("src/fsd/widgets/auth-layout/ui/AuthLayout.tsx", "utf8");
const loginPage = readFileSync("src/fsd/pages/login/ui/LoginPage.tsx", "utf8");
const signupPage = readFileSync("src/fsd/pages/signup/ui/SignupPage.tsx", "utf8");
const resetPage = readFileSync("src/fsd/pages/forgot-password/ui/ForgotPasswordPage.tsx", "utf8");

assert.match(layout, /lg:grid-cols-\[42%_58%\]/);
assert.match(layout, /bg-\[#0F1F2D\]/);
assert.match(layout, /src="\/JobdamIcon\.svg"/);
assert.match(layout, /className="h-auto w-\[132px\]"/);
assert.doesNotMatch(layout, /brightness-0 invert/);
assert.doesNotMatch(layout, /JOBDAM FOR GSM/);
assert.match(layout, /취업과 상담을 한 곳에서/);
assert.doesNotMatch(layout, /Gwangju Software Meister High School/);
assert.doesNotMatch(loginPage, /다시 만나서 반가워요|학교 계정으로 로그인하고/);
assert.doesNotMatch(signupPage, /잡담 계정을 만들어보세요|학교 이메일 인증 후/);
assert.doesNotMatch(resetPage, /학교 이메일로 인증코드를 받은 뒤/);
assert.doesNotMatch(`${layout}\n${loginPage}\n${signupPage}\n${resetPage}`, /\/teacher|\/admin/);

console.log("student auth side panel + original logo contract passed");