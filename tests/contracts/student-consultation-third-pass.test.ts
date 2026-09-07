import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const form = readFileSync(
  resolve(process.cwd(), "src/fsd/features/submit-consultation/ui/ConsultationForm.tsx"),
  "utf8",
);

assert.doesNotMatch(form, />상담 내용 작성</);
assert.doesNotMatch(form, /상담받고 싶은 내용을 편하게 작성해주세요\./);
assert.match(form, />상담 유형</);
assert.match(form, />상담 선생님</);
assert.match(form, /label="상담 제목"/);
assert.match(form, /label="구체적인 고민 내용"/);
assert.doesNotMatch(form, />일정 예약</);
assert.match(form, />상담 희망일/);
assert.match(form, />상담 교시/);
assert.match(form, /lg:grid-cols-\[minmax\(0,1fr\)_520px\]/);
assert.match(form, /min-h-\[320px\]/);
assert.match(form, /min-h-\[720px\]/);
assert.match(form, /bg-brand/);
assert.doesNotMatch(form, /bg-\[#10243E\]|hover:bg-\[#1B3555\]/);
assert.doesNotMatch(form, /수업 담당 선생님의 허가를 먼저 받아주세요|예약 가능|선택됨/);

console.log("student consultation third-pass contract passed");