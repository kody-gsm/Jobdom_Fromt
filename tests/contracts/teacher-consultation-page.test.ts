import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");
const route = read("app/teacher/page.tsx");
const page = read("src/fsd/pages/teacher/ui/TeacherPage.tsx");
const teacherHeader = read("src/fsd/widgets/teacher-header/ui/TeacherHeader.tsx");

assert.match(route, /@fsd\/pages\/teacher/);
assert.doesNotMatch(route, /useState|getTeacherConsultations|approveConsultation/);
assert.match(page, /진로 상담/);
assert.match(page, /WEEKLY_CLASS_SCHEDULE/);
assert.match(page, /getTeacherConsultations\(kind\)/);
assert.match(page, /approveConsultation\(kind,\s*selection.reservation.reservation_id\)/);
assert.match(page, /rejectConsultation\(kind,\s*selection.reservation.reservation_id\)/);
assert.match(page, /상담 신청 취소/);
assert.match(page, /상담 예약 요청 목록/);
assert.match(page, /예약 확정 정보/);
assert.match(page, /@fsd\/widgets\/teacher-header/);
assert.doesNotMatch(page, /@\/app\/utils\/api|@\/app\/components/);
assert.match(teacherHeader, /교사 주요 메뉴/);
assert.match(teacherHeader, /상담 일정/);
assert.match(teacherHeader, /취업 공고/);
assert.match(teacherHeader, /폼 관리/);

console.log("teacher consultation page contract passed");

const { dateKey, getWeek, reservationSlot } = await import("../../src/fsd/pages/teacher/model/calendar.ts");
assert.deepEqual(getWeek(new Date(2026, 8, 6)).map(dateKey), ["2026-08-31", "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04"]);
assert.equal(dateKey(new Date(2026, 8, 9)), "2026-09-09");
assert.equal(reservationSlot({ date: "2026-09-09", period: "3" }), "2026-09-09_3교시");
assert.equal(reservationSlot({ date: "2026-09-09", period: "점심시간" }), "2026-09-09_점심시간");
assert.match(page, /aria-current={isToday/);
assert.match(page, /aria-pressed={isSelected}/);
assert.match(page, /selection.reservation.content/);
assert.match(page, /selection.reservation.student_number/);
assert.match(page, /disabled={isProcessing}/);
assert.match(read("src/fsd/features/submit-consultation/api/consultation.ts"), /"\/api\/teachers"/);
