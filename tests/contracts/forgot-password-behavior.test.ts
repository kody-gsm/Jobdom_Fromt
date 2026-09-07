import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const page = read("src/fsd/pages/forgot-password/ui/ForgotPasswordPage.tsx");
const loginForm = read("src/fsd/features/login/ui/LoginForm.tsx");
const hook = read("src/fsd/features/reset-password/model/useResetPasswordForm.ts");
const validation = read("src/fsd/features/reset-password/model/validation.ts");
const form = read("src/fsd/features/reset-password/ui/ResetPasswordForm.tsx");
const source = `${page}\n${loginForm}\n${hook}\n${validation}\n${form}`;

assert.doesNotMatch(page, /title="비밀번호 재설정"|description=/);
assert.doesNotMatch(page, /비밀번호를 다시 설정해요|학교 이메일로 인증코드를 받은 뒤/);
assert.match(loginForm, /비밀번호 재설정/);
assert.doesNotMatch(loginForm, />\s*비밀번호 찾기\s*</);
assert.match(hook, /sendPasswordResetCode/);
assert.match(hook, /resetPassword/);
assert.match(source, /getGsmEmailErrorMessage/);
assert.match(hook, /가입되지 않은 계정입니다\./);
assert.match(hook, /verificationCountdown\.start\(180\)/);
assert.match(hook, /router\.push\("\/login"\)/);
assert.match(source, /인증코드가 만료되었습니다\. 재발송해주세요\./);

console.log("password reset behavior contract passed");
