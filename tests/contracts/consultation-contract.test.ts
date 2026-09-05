import assert from "node:assert/strict";
import {
  TEACHERS,
  createReservationInput,
  getAvailablePeriods,
  getNextWeekdays,
  toConsultationKind,
  validateConsultationDraft,
} from "../../src/fsd/entities/consultation/model/rules.ts";
import { createConsultationApi } from "../../src/fsd/entities/consultation/api/createConsultationApi.ts";

assert.deepEqual(TEACHERS, [
  "임경원 선생님",
  "김권예소 선생님",
  "정윤기 선생님",
]);
assert.equal(toConsultationKind("career"), "course");
assert.equal(toConsultationKind("general"), "common");
assert.deepEqual(getAvailablePeriods("career", "임경원 선생님"), [
  "1교시", "2교시", "3교시", "4교시", "5교시",
  "6교시", "7교시", "8교시", "9교시",
]);
assert.deepEqual(getAvailablePeriods("career", "김권예소 선생님"), ["점심시간", "저녁시간"]);
assert.deepEqual(getAvailablePeriods("career", null), []);
assert.deepEqual(getAvailablePeriods("general", null), [
  "1교시", "2교시", "3교시", "4교시", "점심시간", "5교시", "6교시", "7교시",
]);

const weekdays = getNextWeekdays(new Date("2026-09-04T09:00:00+09:00"));
assert.equal(weekdays.length, 5);
assert.deepEqual(weekdays.map((item) => item.value), [
  "2026-09-04", "2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10",
]);

const baseDraft = {
  type: "career" as const,
  title: "진로 고민",
  content: "상담 내용",
  teacher: "임경원 선생님",
  date: "2026-09-07",
  period: "3교시",
};
assert.equal(validateConsultationDraft({ ...baseDraft, title: "" }, false), "제목을 입력해주세요");
assert.equal(validateConsultationDraft({ ...baseDraft, content: "" }, false), "내용을 입력해주세요");
assert.equal(validateConsultationDraft({ ...baseDraft, teacher: null }, false), "선생님을 선택해주세요");
assert.equal(validateConsultationDraft({ ...baseDraft, date: null }, false), "날짜를 선택해주세요");
assert.equal(validateConsultationDraft({ ...baseDraft, period: null }, false), "교시를 선택해주세요");
assert.equal(validateConsultationDraft(baseDraft, true), "진로 상담은 중복 신청할 수 없습니다");
assert.equal(validateConsultationDraft(baseDraft, false), null);
assert.deepEqual(createReservationInput(baseDraft), {
  title: "[임경원 선생님] 진로 고민",
  content: "상담 내용",
  date: "2026-09-07",
  period: "3교시",
});

const calls: Array<{ path: string; init?: RequestInit }> = [];
const api = createConsultationApi(async <T>(path: string, init?: RequestInit) => {
  calls.push({ path, init });
  return [] as T;
});
await api.getUpcoming("course");
await api.create("common", {
  title: "일반 상담",
  content: "내용",
  date: "2026-09-08",
  period: "점심시간",
});
assert.equal(calls[0]?.path, "/student/course");
assert.equal(calls[0]?.init, undefined);
assert.equal(calls[1]?.path, "/student/common");
assert.equal(calls[1]?.init?.method, "POST");
assert.equal(calls[1]?.init?.body, JSON.stringify({
  title: "일반 상담", content: "내용", date: "2026-09-08", period: "점심시간",
}));

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const routeSource = readFileSync(resolve(process.cwd(), "app/counsel/page.tsx"), "utf8");
const pageSource = readFileSync(resolve(process.cwd(), "src/fsd/pages/counsel/ui/CounselPage.tsx"), "utf8");
assert.match(routeSource, /@fsd\/pages\/counsel/);
assert.doesNotMatch(routeSource, /useState|useEffect|createConsultation/);
assert.match(pageSource, /@fsd\/features\/submit-consultation/);
assert.match(pageSource, /@fsd\/widgets\/student-header/);
