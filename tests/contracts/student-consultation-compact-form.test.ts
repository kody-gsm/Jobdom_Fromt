import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const form = readFileSync("src/fsd/features/submit-consultation/ui/ConsultationForm.tsx", "utf8");
const schedule = readFileSync("src/fsd/entities/consultation/model/schedule.ts", "utf8");

assert.doesNotMatch(form, />상담 내용 작성</);
assert.doesNotMatch(form, /상담받고 싶은 내용을 편하게 작성해주세요\./);
assert.doesNotMatch(form, /<ContentCard className="mb-6 p-5 sm:p-6">/);

const leftCard = form.indexOf('lg:grid-cols-[minmax(0,1fr)_520px]');
const typeLabel = form.indexOf('>상담 유형<', leftCard);
const teacherLabel = form.indexOf('>상담 선생님<', leftCard);
const titleField = form.indexOf('label="상담 제목"', leftCard);
assert.ok(leftCard >= 0 && typeLabel > leftCard && teacherLabel > typeLabel && titleField > teacherLabel);

assert.match(schedule, /1교시[\s\S]*08:40 - 09:30/);
assert.match(schedule, /2교시[\s\S]*09:40 - 10:30/);
assert.match(schedule, /4교시[\s\S]*11:40 - 12:30/);
assert.match(schedule, /점심시간[\s\S]*12:30 - 13:30/);
assert.match(schedule, /5교시[\s\S]*13:30 - 14:20/);
assert.match(schedule, /7교시[\s\S]*15:30 - 16:20/);
assert.match(schedule, /9교시[\s\S]*18:20 - 19:10/);

assert.doesNotMatch(form, /breakTime|unavailableByTeacher|times\.includes/);
assert.match(form, /const unavailable = isTimeUnavailable\(row\.period\)/);
assert.match(form, /onClick=\{\(\) => toggleTime\(row\.period\)\}/);

console.log("student consultation compact form contract passed");
