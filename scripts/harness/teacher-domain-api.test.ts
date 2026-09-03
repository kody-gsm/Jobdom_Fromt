import assert from "node:assert/strict";
import { createConsultationApi } from "../../src/fsd/entities/consultation/api/createConsultationApi.ts";
import { createFormApi } from "../../src/fsd/entities/form/api/createFormApi.ts";
import { createRecruitApi } from "../../src/fsd/entities/recruit/api/createRecruitApi.ts";

const calls: Array<{ path: string; init?: RequestInit }> = [];
const request = async <T>(path: string, init?: RequestInit) => {
  calls.push({ path, init });
  return {} as T;
};

const consultation = createConsultationApi(request);
await consultation.getTeacher("course");
await consultation.approve("common", 12);
await consultation.lock("course", { date: "2026-09-07", period: "4교시" });

assert.deepEqual(calls.splice(0), [
  { path: "/teacher/course", init: undefined },
  { path: "/teacher/common/allow/12", init: { method: "PATCH" } },
  {
    path: "/teacher/course/lock",
    init: {
      method: "POST",
      body: JSON.stringify({ date: "2026-09-07", period: "4교시" }),
    },
  },
]);

const form = createFormApi(request);
const input = {
  title: "지원서",
  description: "설명",
  questions: [{
    type: "SHORT_TEXT" as const,
    title: "이름",
    description: "",
    required: true,
    options: [],
  }],
};
await form.getTeacherAll();
await form.getTeacherById(7);
await form.createTeacher(input);
await form.updateTeacher(7, input);
await form.publishTeacher(7);
await form.closeTeacher(7);
await form.getSubmissions(7);
await form.getSubmission(7, 21);

assert.deepEqual(calls.splice(0), [
  { path: "/teacher/form", init: undefined },
  { path: "/teacher/form/7", init: undefined },
  { path: "/teacher/form", init: { method: "POST", body: JSON.stringify(input) } },
  { path: "/teacher/form/7", init: { method: "PATCH", body: JSON.stringify(input) } },
  { path: "/teacher/form/7/publish", init: { method: "POST" } },
  { path: "/teacher/form/7/close", init: { method: "POST" } },
  { path: "/teacher/form/7/submission", init: undefined },
  { path: "/teacher/form/7/submission/21", init: undefined },
]);

const recruit = createRecruitApi(request);
const update = {
  companyName: "OpenAI",
  interviewDate: "2026-09-10",
  deadline: "2026-09-08",
  summary: "공고",
};
const image = new File(["image"], "notice.png", { type: "image/png" });
await recruit.getTeacherAll();
await recruit.analyze(image);
await recruit.updateTeacher(3, update);
await recruit.publishTeacher(3);

const recruitCalls = calls.splice(0);
assert.equal(recruitCalls[0]?.path, "/teacher/recruit");
assert.equal(recruitCalls[1]?.path, "/teacher/recruit/analyze");
assert.equal(recruitCalls[1]?.init?.method, "POST");
assert.ok(recruitCalls[1]?.init?.body instanceof FormData);
assert.deepEqual(recruitCalls.slice(2), [
  {
    path: "/teacher/recruit/3",
    init: { method: "PATCH", body: JSON.stringify(update) },
  },
  { path: "/teacher/recruit/3/publish", init: { method: "POST" } },
]);

console.log("teacher domain api contract passed");
