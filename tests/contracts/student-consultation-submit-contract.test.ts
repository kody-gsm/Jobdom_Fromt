import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const api = read("src/fsd/features/submit-consultation/api/consultation.ts");
const hook = read("src/fsd/features/submit-consultation/model/useConsultationForm.ts");
const form = read("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx");

assert.match(api, /\/student\/teachers/);
assert.match(api, /teacherId/);
assert.match(api, /POST/);
assert.match(api, /JSON\.stringify\(input\)/);
assert.match(hook, /getConsultationTeachers/);
assert.match(hook, /selectedTeacherId/);
assert.match(hook, /const teacherId = selectedTeacherId/);
assert.match(hook, /teacherId:\s*teacherId/);
assert.match(hook, /상담 신청 요청을 보냈습니다/);
assert.doesNotMatch(hook, /상담 신청이 완료되었습니다/);
assert.doesNotMatch(hook, /setHasCareerReservation\(true\)/);
assert.match(hook, /unavailableSlotKeys/);
assert.match(hook, /isUnavailableSlotError/);
assert.match(form, /teachers\.map/);
assert.match(form, /isTimeUnavailable\(row\.period\)/);
assert.match(form, /예약 불가/);
assert.doesNotMatch(form, /예약 가능/);
assert.doesNotMatch(form, /선택됨/);

console.log("student consultation submit contract passed");
