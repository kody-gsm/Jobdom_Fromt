import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const paths = {
  login: "src/fsd/features/login/model/validation.ts",
  signup: "src/fsd/features/signup/model/validation.ts",
  reset: "src/fsd/features/reset-password/model/validation.ts",
};

for (const path of Object.values(paths)) {
  assert.equal(existsSync(path), true, `${path} must exist`);
}

const login = readFileSync(paths.login, "utf8");
const signup = readFileSync(paths.signup, "utf8");
const reset = readFileSync(paths.reset, "utf8");

assert.match(login, /validateLoginForm/);
assert.match(login, /getRequiredMessage\("이메일을"\)/);
assert.match(login, /getRequiredMessage\("비밀번호를"\)/);
assert.doesNotMatch(login, /gsm\.hs\.kr/);
assert.match(signup, /getGsmEmailErrorMessage/);
assert.match(signup, /isValidPassword/);
assert.match(signup, /verificationCode\.trim\(\)\.length !== 6/);
assert.match(signup, /values\.password !== values\.confirmPassword/);
assert.match(signup, /영문, 숫자, 특수문자를 포함해 10자 이상 입력해주세요\./);

assert.match(reset, /getGsmEmailErrorMessage/);
assert.match(reset, /isValidPassword/);
assert.match(reset, /verificationCode\.trim\(\)\.length !== 6/);
assert.match(reset, /values\.isCodeExpired/);
assert.match(reset, /values\.password !== values\.confirmPassword/);
assert.match(reset, /인증코드가 만료되었습니다\. 재발송해주세요\./);

console.log("auth form validation contract passed");
