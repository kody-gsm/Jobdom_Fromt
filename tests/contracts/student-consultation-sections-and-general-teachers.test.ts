import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const form = readFileSync("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx", "utf8");
const teacherOption = readFileSync("src/fsd/features/submit-consultation/model/teacherOption.ts", "utf8");

assert.match(teacherOption, /임경원 선생님/);
assert.match(teacherOption, /김권예소 선생님/);
assert.match(teacherOption, /정윤기 선생님/);
assert.match(teacherOption, /getConsultationTeacherOptions/);
assert.match(teacherOption, /type !== "general"/);
assert.match(form, /getConsultationTeacherOptions\(counselType, teachers\)/);
assert.match(form, /displayTeachers\.map/);

assert.doesNotMatch(form, />일정 예약</);
assert.doesNotMatch(form, /상담 희망일과 교시를 선택해 주세요\./);
assert.match(form, />상담 희망일</);
assert.match(form, />상담 교시</);

console.log("student consultation sections and general teachers contract passed");