import assert from "node:assert/strict";

const user = await import("../../src/fsd/entities/user/index.ts");

assert.equal(user.getGsmEmailErrorMessage(""), "이메일을 입력해주세요.");
assert.equal(
  user.getGsmEmailErrorMessage("user@gmail.com"),
  "s로 시작하는 @gsm.hs.kr 이메일을 입력해주세요.",
);
assert.equal(user.getGsmEmailErrorMessage("s123@gsm.hs.kr"), "");
assert.equal(user.isGsmEmail("s123@gsm.hs.kr"), true);
assert.equal(user.isGsmEmail("teacher@gsm.hs.kr"), false);
assert.equal(user.isValidPassword("abc123!@#xyz"), true);

const error = (message: string, status = 400) => ({ message, status });
assert.equal(
  user.getAuthErrorMessage(error("Invalid email or password."), "fallback"),
  "이메일 또는 비밀번호가 올바르지 않습니다.",
);
assert.deepEqual(user.getSignupError(error("Invalid verification code.")), {
  field: "verificationCode",
  message: "인증코드가 올바르지 않습니다.",
});
assert.deepEqual(user.getPasswordResetError(error("Verification code has expired.")), {
  field: "verificationCode",
  message: "인증코드가 만료되었습니다. 재발송해주세요.",
});
