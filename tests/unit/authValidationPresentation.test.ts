import assert from "node:assert/strict";
import {
  getFirstLoginErrorField,
  validateLoginForm,
} from "../../src/fsd/features/login/model/validation.ts";
import {
  getFirstSignupErrorField,
  validateSignupForm,
} from "../../src/fsd/features/signup/model/validation.ts";
import {
  getFirstResetPasswordErrorField,
  validateResetPasswordForm,
} from "../../src/fsd/features/reset-password/model/validation.ts";
import { hasReachedConsentEnd } from "../../src/fsd/features/signup/model/consentContent.ts";

const loginErrors = validateLoginForm({ email: "", password: "" });
assert.equal(getFirstLoginErrorField(loginErrors), "email");
assert.equal(getFirstLoginErrorField({ password: "비밀번호를 입력해주세요." }), "password");

const signupErrors = validateSignupForm({
  email: "",
  verificationCode: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
  privacyAccepted: false,
});
assert.equal(getFirstSignupErrorField(signupErrors), "email");
assert.equal(getFirstSignupErrorField({ verificationCode: "인증코드를 입력해주세요." }), "verificationCode");

const signupConsentErrors = validateSignupForm({
  email: "s25001@gsm.hs.kr",
  verificationCode: "123456",
  password: "Aa12345678!",
  confirmPassword: "Aa12345678!",
  termsAccepted: false,
  privacyAccepted: false,
});
assert.equal(signupConsentErrors.termsAccepted, "이용약관에 동의해주세요.");
assert.equal(signupConsentErrors.privacyAccepted, "개인정보 수집 및 이용에 동의해주세요.");
assert.deepEqual(
  validateSignupForm({
    email: "s25001@gsm.hs.kr",
    verificationCode: "123456",
    password: "Aa12345678!",
    confirmPassword: "Aa12345678!",
    termsAccepted: true,
    privacyAccepted: true,
  }),
  {},
);
assert.equal(hasReachedConsentEnd({ scrollTop: 0, clientHeight: 100, scrollHeight: 100 }), true);
assert.equal(hasReachedConsentEnd({ scrollTop: 0, clientHeight: 100, scrollHeight: 300 }), false);
assert.equal(hasReachedConsentEnd({ scrollTop: 198, clientHeight: 100, scrollHeight: 300 }), true);

const resetErrors = validateResetPasswordForm({
  email: "",
  verificationCode: "",
  password: "",
  confirmPassword: "",
  isCodeExpired: false,
});
assert.equal(getFirstResetPasswordErrorField(resetErrors), "email");
assert.equal(getFirstResetPasswordErrorField({ password: "비밀번호를 입력해주세요." }), "password");

console.log("auth validation presentation tests passed");
