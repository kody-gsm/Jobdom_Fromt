import assert from "node:assert/strict";
import {
  getGsmEmailErrorMessage,
  isGsmEmail,
  isValidPassword,
} from "../../src/fsd/entities/user/index.ts";

assert.equal(getGsmEmailErrorMessage(""), "이메일을 입력해주세요.");
assert.equal(getGsmEmailErrorMessage("user@gmail.com"), "@gsm.hs.kr로 끝나는 학교 계정을 사용해주세요.");
assert.equal(getGsmEmailErrorMessage("teacher@gsm.hs.kr"), "");
assert.equal(getGsmEmailErrorMessage("s123@gsm.hs.kr"), "");
assert.equal(isGsmEmail("s123@gsm.hs.kr"), true);
assert.equal(isGsmEmail("teacher@gsm.hs.kr"), true);
assert.equal(isGsmEmail("s123@gsm.hs.kr.com"), false);
assert.equal(isValidPassword("abc123!@#xyz"), true);

console.log("auth validation policy passed");
