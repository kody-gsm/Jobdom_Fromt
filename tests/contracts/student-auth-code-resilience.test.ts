import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const signup = read("src/fsd/features/signup/model/useSignupForm.ts");
const reset = read("src/fsd/features/reset-password/model/useResetPasswordForm.ts");
const errors = read("src/fsd/entities/user/model/auth-errors.ts");

assert.match(signup, /field === "email"/);
assert.match(signup, /verificationCountdown\.reset/);
assert.match(signup, /resendCountdown\.reset/);
assert.match(signup, /verificationRequestVersion/);
assert.match(reset, /field === "email"/);
assert.match(reset, /verificationCountdown\.reset/);
assert.match(reset, /verificationRequestVersion/);
assert.match(reset, /getPasswordResetCodeError/);
assert.match(errors, /getPasswordResetCodeError/);
assert.match(errors, /429/);
assert.doesNotMatch(reset, /email: "가입되지 않은 계정입니다\."/);

console.log("student auth code resilience contract passed");
