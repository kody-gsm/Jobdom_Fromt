import assert from "node:assert/strict";
import {
  getGsmEmailErrorMessage,
  isGsmEmail,
  isValidPassword,
} from "../../src/fsd/entities/user/index.ts";

assert.equal(getGsmEmailErrorMessage(""), "이메일을 입력해주세요.");
assert.equal(getGsmEmailErrorMessage("user@gmail.com"), "s로 시작하는 @gsm.hs.kr 이메일을 입력해주세요.");
assert.equal(getGsmEmailErrorMessage("teacher@gsm.hs.kr"), "s로 시작하는 @gsm.hs.kr 이메일을 입력해주세요.");
assert.equal(getGsmEmailErrorMessage("s123@gsm.hs.kr"), "");
assert.equal(isGsmEmail("s123@gsm.hs.kr"), true);
assert.equal(isGsmEmail("teacher@gsm.hs.kr"), false);
assert.equal(isValidPassword("abc123!@#xyz"), true);

console.log("auth validation policy passed");
