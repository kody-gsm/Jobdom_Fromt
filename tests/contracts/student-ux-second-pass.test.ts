import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

const authLayout = read("src/fsd/widgets/auth-layout/ui/AuthLayout.tsx");
const signupPage = read("src/fsd/pages/signup/ui/SignupPage.tsx");
const resetPage = read("src/fsd/pages/forgot-password/ui/ForgotPasswordPage.tsx");
const signupForm = read("src/fsd/features/signup/ui/SignupForm.tsx");
const resetForm = read("src/fsd/features/reset-password/ui/ResetPasswordForm.tsx");
const formsPage = read("src/fsd/pages/forms/ui/FormsPage.tsx");
const homeServices = read("src/fsd/widgets/home-services/ui/HomeServices.tsx");

assert.match(authLayout, /lg:grid-cols-\[42%_58%\]/);
assert.match(authLayout, /bg-\[#0F1F2D\]/);
assert.match(authLayout, /JOBDAM FOR GSM|취업과 상담을 한 곳에서/);
assert.match(authLayout, /src="\/JobdamIcon\.svg"/);
assert.doesNotMatch(signupPage, /잡담 계정을 만들어보세요|학교 이메일 인증 후/);
assert.doesNotMatch(resetPage, /학교 이메일로 인증코드를 받은 뒤/);
assert.match(signupForm, /href="\/login"/);
assert.match(signupForm, /로그인/);
assert.match(resetForm, /href="\/login"/);
assert.match(resetForm, /로그인으로 돌아가기/);
assert.match(formsPage, /max-w-\[1180px\]/);
assert.match(formsPage, /md:grid-cols-2 lg:grid-cols-3/);
assert.match(formsPage, /min-h-\[330px\]/);
assert.match(
  homeServices,
  /flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-accent[\s\S]*IoMdChatbubbles[^\n]*className="h-5 w-5"/,
);
assert.doesNotMatch(homeServices, /flex h-14 w-14[^\n]*IoMdChatbubbles/);

console.log("student UX second-pass contract passed");