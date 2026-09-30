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

const loginErrors = validateLoginForm({ email: "", password: "" });
assert.equal(getFirstLoginErrorField(loginErrors), "email");
assert.equal(getFirstLoginErrorField({ password: "비밀번호를 입력해주세요." }), "password");

const signupErrors = validateSignupForm({
  email: "",
  verificationCode: "",
  password: "",
  confirmPassword: "",
});
assert.equal(getFirstSignupErrorField(signupErrors), "email");
assert.equal(getFirstSignupErrorField({ verificationCode: "인증코드를 입력해주세요." }), "verificationCode");

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
