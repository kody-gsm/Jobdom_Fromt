import assert from "node:assert/strict";
import {
  getAuthErrorMessage,
  getPasswordResetError,
  getSignupError,
} from "../app/utils/authErrorMessages.ts";

const error = (message: string, status = 400) => ({ message, status });

assert.equal(getAuthErrorMessage(error("Invalid email or password."), "fallback"), "이메일 또는 비밀번호가 올바르지 않습니다.");
assert.equal(getAuthErrorMessage(error("x", 0), "fallback"), "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
assert.equal(getAuthErrorMessage(error("x", 503), "fallback"), "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
assert.equal(getAuthErrorMessage(error("Internal server error.", 500), "fallback"), "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
assert.equal(getAuthErrorMessage(error("Verification code has expired."), "fallback"), "인증코드가 만료되었습니다. 재발송해주세요.");
assert.equal(getAuthErrorMessage(error("Already signed up."), "fallback"), "이미 가입된 이메일입니다.");

assert.deepEqual(getSignupError(error("Invalid verification code.")), { field: "verificationCode", message: "인증코드가 올바르지 않습니다." });
assert.deepEqual(getSignupError(error("Student information was not found.")), { field: "email", message: "학생 정보를 찾을 수 없습니다." });
assert.equal(getSignupError(error("x", 500)).field, "form");
assert.deepEqual(getPasswordResetError(error("Verification code has expired.")), { field: "verificationCode", message: "인증코드가 만료되었습니다. 재발송해주세요." });
assert.equal(getPasswordResetError(error("x", 500)).field, "form");

console.log("auth error message policy passed");
