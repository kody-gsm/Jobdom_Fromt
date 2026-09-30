import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const form = readFileSync(
  resolve(process.cwd(), "src/fsd/features/submit-consultation/ui/ConsultationForm.tsx"),
  "utf8",
);

assert.match(form, /SegmentedTabs/);
assert.match(form, /label="상담 제목"/);
assert.match(form, /placeholder="상담 제목을 작성해주세요"/);
assert.match(form, /scheduleRows\.map/);
assert.match(form, /disabled=\{!available\}/);
assert.match(form, /availabilityStatus/);
assert.match(form, /retryAvailability/);
assert.match(form, /setCalendarDate/);
assert.match(form, /\[selectedDate\]/);
assert.doesNotMatch(form, /수업 담당 선생님의 허가를 먼저 받아주세요/);

console.log("student consultation third-pass contract passed");
