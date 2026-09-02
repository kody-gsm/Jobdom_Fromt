import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const login = read("app/(auth)/login/page.tsx");
const signup = read("app/(auth)/signup/page.tsx");
const forgot = read("app/(auth)/forgot-password/page.tsx");

assert.match(login, /getAuthErrorMessage/);
assert.match(login, /비밀번호를 입력해주세요\./);
assert.doesNotMatch(login, /passwordError[\s\S]*비밀번호가 일치하지 않습니다\./);

assert.match(signup, /getGsmEmailErrorMessage/);
assert.match(signup, /getSignupError/);
assert.match(signup, /submitError/);
assert.doesNotMatch(signup, /\^s\.\*@gsm/);

assert.match(forgot, /getGsmEmailErrorMessage/);
assert.match(forgot, /getPasswordResetError/);
assert.match(forgot, /인증코드 6자리를 입력해주세요\./);
assert.match(forgot, /인증코드가 만료되었습니다\. 재발송해주세요\./);
assert.doesNotMatch(forgot, /가입되지 않은 이메일입니다\./);
assert.doesNotMatch(forgot, /if \(!isValid\) return;/);

console.log("auth page error contracts passed");
