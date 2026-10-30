import assert from "node:assert/strict";
import { createConsultationApi } from "../../src/fsd/entities/consultation/api/createConsultationApi.ts";
import { createFormApi } from "../../src/fsd/entities/form/api/createFormApi.ts";
import { createRecruitApi } from "../../src/fsd/entities/recruit/api/createRecruitApi.ts";
import type { ApiRequestInit } from "../../src/fsd/shared/api/client.ts";

const calls: Array<{ path: string; init?: RequestInit }> = [];
const request = async <T>(path: string, init?: ApiRequestInit) => {
  // Compare the HTTP contract independently of frontend cache metadata.
  if (init) {
    const { invalidateCache, ...wireInit } = init;
    if (init.method && init.method !== "GET") assert.ok(invalidateCache?.length);
    calls.push({ path, init: wireInit });
  } else {
    calls.push({ path, init });
  }
  return {} as T;
};

const consultation = createConsultationApi(request);
await consultation.getTeacher("course");
await consultation.approve("common", 12);
await consultation.reject("course", 13);
await consultation.lock("course", { date: "2026-09-07", period: "4교시" });
await consultation.unlock("course", { date: "2026-09-07", period: "4교시" });

assert.deepEqual(calls.splice(0), [
  { path: "/teacher/course", init: undefined },
  { path: "/teacher/common/allow/12", init: { method: "PATCH" } },
  { path: "/teacher/course/reject/13", init: { method: "PATCH" } },
  {
    path: "/teacher/course/lock",
    init: {
      method: "POST",
      body: JSON.stringify({ date: "2026-09-07", period: "4교시" }),
    },
  },
  {
    path: "/teacher/course/unlock",
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
const secondImage = new File(["image-2"], "notice-2.png", { type: "image/png" });
await recruit.getTeacherAll();
await recruit.createTeacher(update, false);
await recruit.analyze([image, secondImage], false);
await recruit.updateTeacher(3, update);
await recruit.addImages(3, [secondImage]);
await recruit.deleteImage(3, 11);
await recruit.publishTeacher(3);
await recruit.deleteTeacher(3);

const recruitCalls = calls.splice(0);
assert.equal(recruitCalls[0]?.path, "/teacher/recruit");
// 지원 폼 생성 여부는 공고를 만들 때만 보낸다.
assert.deepEqual(recruitCalls[1], {
  path: "/teacher/recruit",
  init: { method: "POST", body: JSON.stringify({ ...update, createForm: false }) },
});
assert.equal(recruitCalls[2]?.path, "/teacher/recruit/analyze");
assert.equal(recruitCalls[2]?.init?.method, "POST");
const analyzeBody = recruitCalls[2]?.init?.body;
assert.ok(analyzeBody instanceof FormData);
// 서버는 같은 이름(image)으로 여러 장을 받는다.
assert.deepEqual(analyzeBody.getAll("image").map((file) => (file as File).name), ["notice.png", "notice-2.png"]);
assert.equal(analyzeBody.get("createForm"), "false");
assert.equal(recruitCalls[4]?.path, "/teacher/recruit/3/image");
assert.equal(recruitCalls[4]?.init?.method, "POST");
const addImagesBody = recruitCalls[4]?.init?.body;
assert.ok(addImagesBody instanceof FormData);
assert.deepEqual(addImagesBody.getAll("image").map((file) => (file as File).name), ["notice-2.png"]);
assert.equal(addImagesBody.has("createForm"), false);
assert.deepEqual([recruitCalls[3], ...recruitCalls.slice(5)], [
  {
    path: "/teacher/recruit/3",
    init: { method: "PATCH", body: JSON.stringify(update) },
  },
  { path: "/teacher/recruit/3/image/11", init: { method: "DELETE" } },
  { path: "/teacher/recruit/3/publish", init: { method: "POST" } },
  { path: "/teacher/recruit/3", init: { method: "DELETE" } },
]);

// 기본 공지 채널 알림은 서버가 공개와 함께 보내므로 공개 요청 뒤에 /api/notices를 자동 호출하지 않는다.
assert.ok(recruitCalls.every(({ path }) => !path.startsWith("/api/notices")));

const channels = [
  { id: "1564185374937452697", name: "취업-공지", categoryName: "공지" },
  { id: "1564185448283242586", name: "자유", categoryName: null },
];
const noticeCalls: Array<{ path: string; init?: RequestInit }> = [];
const noticeApi = createRecruitApi(async <T>(path: string, init?: RequestInit) => {
  noticeCalls.push({ path, init });
  return (path === "/api/notices/channels" ? channels : "message-id") as T;
});
const controller = new AbortController();
assert.deepEqual(await noticeApi.getNoticeChannels(controller.signal), channels);
assert.deepEqual(noticeCalls[0], { path: "/api/notices/channels", init: { signal: controller.signal } });
const publishedRecruit = { id: 3, companyName: "OpenAI", interviewDate: null, deadline: null, summary: " 공고 요약 ", fields: ["FRONTEND", "AI"] as const, status: "PUBLISHED" as const, createdAt: "", updatedAt: "" };
assert.equal(await noticeApi.sendNoticeToChannel({ ...publishedRecruit, fields: [...publishedRecruit.fields] }, "1564185374937452697"), "message-id");
assert.equal(noticeCalls[1]?.path, "/api/notices/send");
assert.equal(noticeCalls[1]?.init?.method, "POST");
// 채널 ID는 안전 정수 범위를 넘으므로 문자열 그대로 보낸다.
assert.deepEqual(JSON.parse(String(noticeCalls[1]?.init?.body)), {
  channelId: "1564185374937452697",
  title: "OpenAI 공고",
  content: "공고 요약",
  field: "프론트엔드, AI·데이터",
});
await assert.rejects(createRecruitApi(async <T>() => [{ id: 1564185374937452697, name: "x", categoryName: null }] as T).getNoticeChannels(), /응답 형식/);
assert.throws(() => noticeApi.sendNoticeToChannel({ ...publishedRecruit, fields: [] }, ""), /채널/);
assert.equal(noticeCalls.length, 2);
assert.equal(calls.length, 0);

console.log("teacher domain api contract passed");
