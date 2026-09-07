import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const hook = read("src/fsd/features/signup/model/useSignupForm.ts");
const validation = read("src/fsd/features/signup/model/validation.ts");
const form = read("src/fsd/features/signup/ui/SignupForm.tsx");
const source = `${hook}\n${validation}\n${form}`;

assert.match(hook, /sendSignupVerificationCode/);
assert.match(hook, /signup\(/);
assert.match(source, /getGsmEmailErrorMessage/);
assert.match(validation, /verificationCode\.trim\(\)\.length !== 6/);
assert.match(validation, /isValidPassword/);
assert.match(validation, /values\.password !== values\.confirmPassword/);
assert.match(hook, /verificationCountdown\.start\(180\)/);
assert.match(hook, /resendCountdown\.start\(2\)/);
assert.match(hook, /router\.push\("\/login"\)/);
assert.match(source, /인증코드가 만료되었습니다\. 재발송해주세요\./);
assert.doesNotMatch(form, /useState|useEffect/);

console.log("signup behavior contract passed");