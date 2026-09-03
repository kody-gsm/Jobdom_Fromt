import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const routes = {
  login: read("app/(auth)/login/page.tsx"),
  signup: read("app/(auth)/signup/page.tsx"),
  forgot: read("app/(auth)/forgot-password/page.tsx"),
};

assert.match(routes.login, /@fsd\/pages\/login/);
assert.match(routes.signup, /@fsd\/pages\/signup/);
assert.match(routes.forgot, /@fsd\/pages\/forgot-password/);
for (const source of Object.values(routes)) {
  assert.doesNotMatch(source, /useState|useEffect|@\/app\/utils/);
}

const login = read("src/fsd/features/login/ui/LoginForm.tsx");
const signup = read("src/fsd/features/signup/ui/SignupForm.tsx");
const reset = read("src/fsd/features/reset-password/ui/ResetPasswordForm.tsx");

assert.match(login, /readRememberLoginPreference/);
assert.match(login, /restoreRememberedSession/);
assert.match(login, /getRoleHomePath/);
assert.match(login, /이메일 또는 비밀번호가 올바르지 않습니다\./);
assert.doesNotMatch(login, /gsm\.hs\.kr/);

assert.match(signup, /getGsmEmailErrorMessage/);
assert.match(signup, /getSignupError/);
assert.match(signup, /sendSignupVerificationCode/);
assert.match(signup, /인증코드가 만료되었습니다\. 재발송해주세요\./);

assert.match(reset, /getGsmEmailErrorMessage/);
assert.match(reset, /getPasswordResetError/);
assert.match(reset, /sendPasswordResetCode/);
assert.match(reset, /인증코드 6자리를 입력해주세요\./);

for (const source of [login, signup, reset]) {
  assert.match(source, /@fsd\/shared\/ui/);
  assert.doesNotMatch(source, /@\/app\//);
}
