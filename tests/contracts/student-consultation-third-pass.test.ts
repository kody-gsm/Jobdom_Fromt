import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const form = readFileSync(
  resolve(process.cwd(), "src/fsd/features/submit-consultation/ui/ConsultationForm.tsx"),
  "utf8",
);

assert.match(form, /상담 내용 작성/);
assert.match(form, /일정 예약/);
assert.match(form, /lg:grid-cols-\[minmax\(0,1fr\)_minmax\(360px,0\.72fr\)\]/);
assert.match(form, /min-h-\[320px\]/);
assert.match(form, /bg-\[#02C551\]/);
assert.match(form, /border-\[#02C551\]/);
assert.doesNotMatch(form, /bg-\[#10243E\]|hover:bg-\[#1B3555\]/);
assert.doesNotMatch(form, /수업 담당 선생님의 허가를 먼저 받아주세요/);
assert.doesNotMatch(form, /STEP 0/);
assert.doesNotMatch(form, /예약 가능/);
assert.doesNotMatch(form, /선택됨/);

console.log("student consultation third-pass contract passed");
