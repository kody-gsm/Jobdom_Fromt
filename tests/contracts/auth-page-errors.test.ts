import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const login = [
  "src/fsd/features/login/model/useLoginForm.ts",
  "src/fsd/features/login/model/validation.ts",
  "src/fsd/features/login/ui/LoginForm.tsx",
].map(read).join("\n");
const signup = [
  "src/fsd/features/signup/model/useSignupForm.ts",
  "src/fsd/features/signup/model/validation.ts",
  "src/fsd/features/signup/ui/SignupForm.tsx",
].map(read).join("\n");
const forgot = [
  "src/fsd/features/reset-password/model/useResetPasswordForm.ts",
  "src/fsd/features/reset-password/model/validation.ts",
  "src/fsd/features/reset-password/ui/ResetPasswordForm.tsx",
].map(read).join("\n");

assert.match(login, /getAuthErrorMessage/);
assert.match(login, /getRequiredMessage\("비밀번호를"\)/);
assert.doesNotMatch(login, /비밀번호가 일치하지 않습니다\./);assert.match(signup, /getGsmEmailErrorMessage/);
assert.match(signup, /getSignupError/);
assert.match(signup, /submitError/);
assert.doesNotMatch(signup, /\^s\.\*@gsm/);

assert.match(forgot, /getGsmEmailErrorMessage/);
assert.match(forgot, /getPasswordResetError/);
assert.match(forgot, /인증코드 6자리를 입력해주세요\./);
assert.match(forgot, /인증코드가 만료되었습니다\. 재발송해주세요\./);
assert.doesNotMatch(forgot, /가입되지 않은 이메일입니다\./);

console.log("auth page error contracts passed");