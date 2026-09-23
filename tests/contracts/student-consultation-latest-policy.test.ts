import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  getNextAvailableDate,
  getSelectableConsultationDates,
} from "../../src/fsd/entities/consultation/model/rules.ts";
import { CONSULTATION_SCHEDULE } from "../../src/fsd/entities/consultation/model/schedule.ts";

assert.deepEqual(
  CONSULTATION_SCHEDULE.map(({ period }) => period),
  [
    "1교시",
    "2교시",
    "3교시",
    "4교시",
    "점심시간",
    "5교시",
    "6교시",
    "7교시",
    "8교시",
    "9교시",
    "저녁시간",
  ],
);
assert.equal(
  CONSULTATION_SCHEDULE.find(({ period }) => period === "8교시")?.time,
  "16:40 - 17:30",
);
assert.equal(
  CONSULTATION_SCHEDULE.find(({ period }) => period === "9교시")?.time,
  "17:40 - 18:30",
);
assert.equal(
  CONSULTATION_SCHEDULE.find(({ period }) => period === "저녁시간")?.time,
  "18:30 - 19:30",
);

assert.equal(
  getNextAvailableDate(
    "2026-09-23",
    new Date("2026-09-23T19:29:59+09:00"),
  ),
  "2026-09-23",
);
assert.equal(
  getNextAvailableDate(
    "2026-09-23",
    new Date("2026-09-23T19:30:00+09:00"),
  ),
  "2026-09-24",
);
assert.equal(
  getNextAvailableDate(
    "2026-09-23",
    new Date("2026-09-23T19:30:00+09:00"),
    new Set(["2026-09-24"]),
  ),
  "2026-09-25",
);
assert.equal(
  getNextAvailableDate(
    "2026-09-23",
    new Date("2026-09-24T09:00:00+09:00"),
  ),
  "2026-09-24",
);

assert.deepEqual(
  getSelectableConsultationDates(
    [
      { day: "수", date: 23, value: "2026-09-23" },
      { day: "목", date: 24, value: "2026-09-24" },
      { day: "금", date: 25, value: "2026-09-25" },
    ],
    new Date("2026-09-23T19:30:00+09:00"),
    new Set(["2026-09-24"]),
  ).map(({ value }) => value),
  ["2026-09-25"],
);

const form = readFileSync(
  resolve(process.cwd(), "src/fsd/features/submit-consultation/ui/ConsultationForm.tsx"),
  "utf8",
);
assert.match(form, /placeholder="상담 제목을 작성해주세요"/);

const api = readFileSync(
  resolve(process.cwd(), "src/fsd/features/submit-consultation/api/consultation.ts"),
  "utf8",
);
assert.match(api, /\/schedules\?/);

console.log("student consultation latest policy contract passed");
