import assert from "node:assert/strict";
import {
  getFormValueError,
  getIdentityField,
  sanitizeIdentityValue,
} from "../../src/fsd/entities/form/model/validation.ts";
import type { FormQuestion } from "../../src/fsd/entities/form/model/types.ts";

const question = (title: string): FormQuestion => ({
  id: 1,
  orderIndex: 0,
  type: "SHORT_TEXT",
  title,
  description: null,
  required: true,
  options: [],
});

assert.equal(getIdentityField("학번"), "studentNumber");
assert.equal(getIdentityField("이 름"), "name");
assert.equal(getIdentityField("자기소개"), null);
assert.equal(sanitizeIdentityValue("학번", "a12-34"), "1234");
assert.equal(sanitizeIdentityValue("이름", "홍길동12"), "홍길동");
assert.equal(sanitizeIdentityValue("자기소개", "abc12"), "abc12");
assert.equal(getFormValueError(question("학번"), "12a"), "학번은 숫자만 입력해주세요.");
assert.equal(getFormValueError(question("이름"), "홍길동2"), "이름에는 숫자를 입력할 수 없습니다.");
assert.equal(getFormValueError(question("학번"), "1234"), "");
assert.equal(getFormValueError(question("이름"), "홍길동"), "");

console.log("form identity validation tests passed");
