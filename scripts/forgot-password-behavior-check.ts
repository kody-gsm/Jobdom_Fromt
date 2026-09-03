import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "src/fsd/features/reset-password/ui/ResetPasswordForm.tsx"),
  "utf8",
);

assert.match(source, /sendPasswordResetCode/);
assert.match(source, /resetPassword/);
assert.match(source, /getGsmEmailErrorMessage/);
assert.match(source, /verificationCode\.length !== 6/);
assert.match(source, /isValidPassword/);
assert.match(source, /password !== confirmPassword/);
assert.match(source, /setTimeLeft\(180\)/);
assert.match(source, /router\.push\("\/login"\)/);
assert.match(source, /인증코드가 만료되었습니다\. 재발송해주세요\./);

console.log("forgot password behavior contract passed");
