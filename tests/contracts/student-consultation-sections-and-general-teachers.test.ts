import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const form = readFileSync("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx", "utf8");
const teacherOption = readFileSync("src/fsd/features/submit-consultation/model/teacherOption.ts", "utf8");
const hook = readFileSync("src/fsd/features/submit-consultation/model/useConsultationForm.ts", "utf8");

assert.match(teacherOption, /임경원 선생님/);
assert.match(teacherOption, /getDefaultGeneralTeacher/);
assert.match(teacherOption, /type === "career" \? teachers : \[\]/);
assert.match(form, /counselType === "career"/);
assert.match(form, /displayTeachers\.map/);
assert.match(form, /selectedTeacher \?\? "상담 선생님 배정 중"/);
assert.match(hook, /getDefaultGeneralTeacher/);

assert.doesNotMatch(form, />일정 예약</);
assert.doesNotMatch(form, /상담 희망일과 교시를 선택해 주세요\./);
assert.match(form, />상담 희망일</);
assert.match(form, />상담 교시</);

console.log("student consultation sections and teacher assignment contract passed");