import assert from "node:assert/strict";
import { getTimetableSubject } from "../../src/fsd/features/submit-consultation/model/timetablePresentation.ts";
import { createTimetablePath } from "../../src/fsd/features/submit-consultation/model/timetablePath.ts";

assert.equal(
  createTimetablePath("2026-09-21", "2026-09-25"),
  "/student/timetable?from=2026-09-21&to=2026-09-25",
);

const timetable = [
  { date: "2026-09-21", period: "1교시", subject: "수학", classroom: "" },
  { date: "2026-09-21", period: "2교시", subject: "영어", classroom: "" },
];

assert.equal(getTimetableSubject(timetable, "2026-09-21", "1교시"), "수학");
assert.equal(getTimetableSubject(timetable, "2026-09-22", "1교시"), null);
assert.equal(getTimetableSubject(timetable, "2026-09-21", "3교시"), null);
