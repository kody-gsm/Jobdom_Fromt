import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const hook = read("src/fsd/features/signup/model/useSignupForm.ts");
const validation = read("src/fsd/features/signup/model/validation.ts");
const form = read("src/fsd/features/signup/ui/SignupForm.tsx");
const dialog = read("src/fsd/features/signup/ui/SignupConsentDialog.tsx");
const consent = read("src/fsd/features/signup/model/consentContent.ts");
const source = `${hook}\n${validation}\n${form}\n${dialog}\n${consent}`;

assert.match(hook, /sendSignupVerificationCode/);
assert.match(hook, /signup\(/);
assert.match(source, /getGsmEmailErrorMessage/);
assert.match(validation, /verificationCode\.trim\(\)\.length !== 6/);
assert.match(validation, /isValidPassword/);
assert.match(validation, /values\.password !== values\.confirmPassword/);
assert.match(hook, /verificationCountdown\.start\(180\)/);
assert.match(hook, /resendCountdown\.start\(2\)/);
assert.match(hook, /router\.push\("\/login"\)/);
assert.match(hook, /termsAccepted/);
assert.match(hook, /privacyAccepted/);
assert.match(source, /인증코드가 만료되었습니다\. 재발송해주세요\./);
assert.match(source, /이용약관에 동의해주세요\./);
assert.match(source, /개인정보 수집 및 이용에 동의해주세요\./);
assert.match(form, /이용약관에 동의합니다/);
assert.match(form, /개인정보 수집 및 이용에 동의합니다/);
assert.match(form, /이용약관 보기/);
assert.match(form, /개인정보 처리방침 보기/);
assert.match(dialog, /onScroll/);
assert.match(consent, /scrollTop/);
assert.match(dialog, /role="dialog"/);
assert.doesNotMatch(form, /useState|useEffect/);

console.log("signup behavior contract passed");
