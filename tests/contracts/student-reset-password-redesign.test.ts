import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const hookPath = "src/fsd/features/reset-password/model/useResetPasswordForm.ts";
const formPath = "src/fsd/features/reset-password/ui/ResetPasswordForm.tsx";
assert.equal(existsSync(hookPath), true, `${hookPath} must exist`);

const hook = readFileSync(hookPath, "utf8");
const form = readFileSync(formPath, "utf8");
const slice = `${hook}\n${form}`;

assert.match(hook, /validateResetPasswordForm/);
assert.match(hook, /sendPasswordResetCode/);
assert.match(hook, /resetPassword\(/);
assert.match(hook, /useCountdown/);
assert.match(hook, /normalizeVerificationCode/);
assert.match(hook, /getPasswordResetError/);
assert.match(hook, /router\.push\("\/login"\)/);
assert.match(hook, /verificationCountdown\.start\(180\)/);
assert.match(form, /useResetPasswordForm/);
assert.match(form, /TextField/);
assert.match(form, /PasswordField/);
assert.match(form, /ActionButton/);
assert.match(slice, /인증코드 발송/);
assert.doesNotMatch(form, /useState|useEffect/);
assert.doesNotMatch(form, /sendPasswordResetCode|resetPassword\(/);

console.log("student reset password redesign contract passed");