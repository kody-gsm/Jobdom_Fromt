import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const helperPath = "src/fsd/features/submit-consultation/model/schedulePresentation.ts";
assert.ok(existsSync(helperPath), "schedule presentation helper must exist");

const form = readFileSync(
  "src/fsd/features/submit-consultation/ui/ConsultationForm.tsx",
  "utf8",
);
const helper = readFileSync(helperPath, "utf8");
const schedule = readFileSync("src/fsd/entities/consultation/model/schedule.ts", "utf8");

assert.match(helper, /CONSULTATION_SCHEDULE/);
assert.doesNotMatch(form, />일정 예약</);
assert.doesNotMatch(form, /상담 희망일과 교시를 선택해 주세요\./);
assert.match(form, />상담 희망일</);
assert.match(form, />상담 교시</);
assert.match(form, /CONSULTATION_SCHEDULE_ROWS\.map/);
assert.match(form, /row\.time/);
assert.match(form, /getConsultationWeekdayLabel\(item\.value\)/);
assert.match(schedule, /1교시[\s\S]*08:40 - 09:30/);
assert.match(schedule, /점심시간[\s\S]*12:30 - 13:30/);
assert.match(schedule, /7교시[\s\S]*15:30 - 16:20/);
assert.match(form, /예약 불가/);
assert.match(form, /ContentCard className="min-h-\[720px\] p-6 sm:p-8"/);
assert.doesNotMatch(form, /예약 가능|선택됨|상담 확정 신청/);
assert.match(form, /grid-cols-5/);

console.log("student consultation schedule panel contract passed");
