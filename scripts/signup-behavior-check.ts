import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "src/fsd/features/signup/ui/SignupForm.tsx"),
  "utf8",
);

assert.match(source, /sendSignupVerificationCode/);
assert.match(source, /signup/);
assert.match(source, /getGsmEmailErrorMessage/);
assert.match(source, /form\.verificationCode\.length !== 6/);
assert.match(source, /isValidPassword/);
assert.match(source, /form\.password !== form\.confirm/);
assert.match(source, /setTimeLeft\(180\)/);
assert.match(source, /setResendCooldown\(2\)/);
assert.match(source, /router\.push\("\/login"\)/);
assert.match(source, /인증코드가 만료되었습니다\. 재발송해주세요\./);

console.log("signup behavior contract passed");
