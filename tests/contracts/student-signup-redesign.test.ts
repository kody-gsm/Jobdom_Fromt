import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const hookPath = "src/fsd/features/signup/model/useSignupForm.ts";
const formPath = "src/fsd/features/signup/ui/SignupForm.tsx";
assert.equal(existsSync(hookPath), true, `${hookPath} must exist`);

const hook = readFileSync(hookPath, "utf8");
const form = readFileSync(formPath, "utf8");
const slice = `${hook}\n${form}`;

assert.match(hook, /validateSignupForm/);
assert.match(hook, /sendSignupVerificationCode/);
assert.match(hook, /signup\(/);
assert.match(hook, /useCountdown/);
assert.match(hook, /normalizeVerificationCode/);
assert.match(hook, /getSignupError/);
assert.match(hook, /router\.push\("\/login"\)/);
assert.match(hook, /verificationCountdown\.start\(180\)/);
assert.match(hook, /resendCountdown\.start\(2\)/);
assert.match(form, /useSignupForm/);
assert.match(form, /TextField/);
assert.match(form, /PasswordField/);
assert.match(form, /ActionButton/);
assert.match(slice, /인증코드 발송/);
assert.match(slice, /인증코드 재발송/);
assert.doesNotMatch(form, /useState|useEffect/);
assert.doesNotMatch(form, /sendSignupVerificationCode|signup\(/);

console.log("student signup redesign contract passed");
