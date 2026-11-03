import assert from "node:assert/strict";
import {
  createRecruitDashboardLoader,
  findRecruitForm,
} from "../../src/fsd/features/manage-recruit/model/dashboard.ts";

const recruit = {
  id: 1,
  companyName: "주식회사 잡담",
  interviewDate: "2026-09-10",
  deadline: "2026-09-08",
  summary: "프론트엔드",
  formId: 10,
  status: "DRAFT" as const,
  createdAt: "2026-09-01",
  updatedAt: "2026-09-01",
};
const forms = [
  { id: 10, title: "(주) 잡담 지원서", description: null, deadline: null, status: "PUBLISHED" as const, questionCount: 2, createdAt: "2026-09-01" },
];

assert.equal(findRecruitForm(recruit, forms)?.id, 10);
assert.equal(findRecruitForm({ ...recruit, companyName: null }, forms)?.id, 10);
assert.equal(findRecruitForm({ ...recruit, formId: null }, forms)?.id, 10);
assert.equal(findRecruitForm({ ...recruit, formId: 11 }, forms), null);

const submissionCalls: number[] = [];
const load = createRecruitDashboardLoader({
  getTeacherRecruits: async () => [recruit],
  getTeacherForms: async () => forms,
  getFormSubmissions: async (formId: number) => {
    submissionCalls.push(formId);
    return [{ id: 99, userId: 7, userName: "학생", studentNumber: "2101", submittedAt: "2026-09-03T10:00:00Z" }];
  },
});
const rows = await load();
assert.equal(rows.length, 1);
assert.equal(rows[0].form?.id, 10);
assert.equal(rows[0].applicants[0].id, 99);
assert.deepEqual(submissionCalls, [10]);

// '새로고침'은 30초 조회 캐시를 거치지 않고 공고·폼·지원자를 모두 새로 받는다.
const inits: unknown[] = [];
const freshLoad = createRecruitDashboardLoader({
  getTeacherRecruits: async (init) => { inits.push(init); return [recruit]; },
  getTeacherForms: async (init) => { inits.push(init); return forms; },
  getFormSubmissions: async (_formId, init) => { inits.push(init); return []; },
});
await freshLoad({ fresh: true });
assert.deepEqual(inits, [{ cache: "no-store" }, { cache: "no-store" }, { cache: "no-store" }]);
inits.length = 0;
await freshLoad();
assert.deepEqual(inits, [undefined, undefined, undefined]);

console.log("teacher recruit dashboard contract passed");
