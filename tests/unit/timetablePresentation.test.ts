import assert from "node:assert/strict";
import { getTimetableSubject } from "../../src/fsd/features/submit-consultation/model/timetablePresentation.ts";

const timetable = [
  { dayOfWeek: "MONDAY", period: "1교시", subjectName: "수학" },
  { dayOfWeek: "MONDAY", period: "2교시", subjectName: "영어" },
];

assert.equal(getTimetableSubject(timetable, "2026-09-21", "1교시"), "수학");
assert.equal(getTimetableSubject(timetable, "2026-09-21", "3교시"), null);

console.log("timetable presentation test passed");
