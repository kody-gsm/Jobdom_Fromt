import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync("src/fsd/widgets/auth-layout/ui/AuthLayout.tsx", "utf8");
const loginPage = readFileSync("src/fsd/pages/login/ui/LoginPage.tsx", "utf8");
const signupPage = readFileSync("src/fsd/pages/signup/ui/SignupPage.tsx", "utf8");
const resetPage = readFileSync("src/fsd/pages/forgot-password/ui/ForgotPasswordPage.tsx", "utf8");

assert.match(layout, /lg:grid-cols-\[42%_58%\]/);
assert.match(layout, /bg-\[#0F1F2D\]/);
assert.match(layout, /brightness-0 invert/);
assert.match(layout, /JOBDAM FOR GSM/);
assert.match(layout, /취업과 상담을 한 곳에서/);
assert.match(layout, /더 편하게 이어가세요/);
assert.match(layout, /상담 신청부터 채용 공고와 설문까지/);
assert.match(layout, /Gwangju Software Meister High School/);
assert.doesNotMatch(layout, /-left-28|-top-28|-bottom-36|-right-28/);
assert.doesNotMatch(loginPage, /다시 만나서 반가워요/);
assert.doesNotMatch(loginPage, /학교 계정으로 로그인하고/);
assert.match(signupPage, /잡담 계정을 만들어보세요/);
assert.match(resetPage, /비밀번호/);
assert.doesNotMatch(`${layout}\n${loginPage}\n${signupPage}\n${resetPage}`, /\/teacher|\/admin/);

console.log("student auth original side panel contract passed");
