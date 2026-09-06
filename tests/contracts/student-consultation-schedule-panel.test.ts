import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const helperPath = "src/fsd/features/submit-consultation/model/schedulePresentation.ts";
assert.ok(existsSync(helperPath), "schedule presentation helper must exist");

const form = readFileSync(
  "src/fsd/features/submit-consultation/ui/ConsultationForm.tsx",
  "utf8",
);
const helper = readFileSync(helperPath, "utf8");

assert.match(form, /상담 희망일과 교시를 선택해 주세요\./);
assert.match(form, /CONSULTATION_SCHEDULE_ROWS\.map/);
assert.match(form, /row\.time/);
assert.match(form, /getConsultationWeekdayLabel\(item\.value\)/);
assert.match(helper, /1교시[\s\S]*09:00 - 09:50/);
assert.match(helper, /점심시간[\s\S]*12:50 - 13:50/);
assert.match(helper, /7교시[\s\S]*16:00 - 16:50/);
assert.match(form, /예약 불가/);
assert.doesNotMatch(form, /예약 가능|선택됨|상담 확정 신청/);
assert.match(form, /grid-cols-5/);
assert.match(form, /border-\[#02C551\][\s\S]*bg-\[#EAF9F0\]/);

console.log("student consultation schedule panel contract passed");
