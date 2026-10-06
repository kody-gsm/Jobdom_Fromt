import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createSyncStudents } from "../../src/fsd/features/sync-students/api/createSyncStudents.ts";
import { getActionActivity, getActivityPagePath, getActivityFilterError, getDefaultActivityFilter } from "../../src/fsd/entities/user/model/activity.ts";
import { createActivityApi } from "../../src/fsd/entities/user/api/createActivityApi.ts";
import { createActivityTrackingRequest } from "../../src/fsd/entities/user/api/createActivityTrackingRequest.ts";
import { ApiError } from "../../src/fsd/shared/api/ApiError.ts";
import { createAuthenticatedRequest } from "../../src/fsd/shared/api/createAuthenticatedRequest.ts";

const calls: Array<[string, RequestInit | undefined]> = [];
const syncStudents = createSyncStudents(async <T>(path: string, init?: RequestInit) => {
  calls.push([path, init]);
  return { syncedCount: 27 } as unknown as T;
});

assert.deepEqual(await syncStudents(), { syncedCount: 27 });
assert.equal(calls[0]?.[0], "/admin/students/sync");
assert.equal(calls[0]?.[1]?.method, "POST");

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const route = read("app/admin/page.tsx");
const page = read("src/fsd/pages/admin/ui/AdminPage.tsx");

assert.match(route, /@fsd\/pages\/admin/);
assert.match(page, /SiteHeader/);
assert.match(page, /syncStudents/);
assert.match(page, /관리자 계정으로 로그인해야 실행할 수 있습니다/);
assert.match(page, /syncedCount/);
assert.doesNotMatch(page, /router\.replace/);

assert.equal(getActivityPagePath("/forms/12?token=secret#answer"), "/forms/12");
assert.equal(getActivityPagePath("/login?email=secret"), null);
assert.equal(getActivityPagePath("/unknown/private-value"), null);
assert.deepEqual(getActionActivity("/student/course?title=secret", "POST"), { type: "CONSULTATION_REQUESTED", path: "/student/course" });
assert.equal(getActionActivity("/student/form/2/submission", "GET"), null);
assert.equal(getActionActivity("/auth/password/reset", "POST"), null);
assert.equal(getActionActivity("/activity/events", "POST"), null);
assert.equal(getActionActivity("/api/notifications/subscribe-ticket", "POST"), null);
assert.equal(getActivityFilterError({ from: "2026-02-30", to: "2026-03-01" }), "올바른 조회 날짜를 선택해 주세요.");
assert.equal(getActivityFilterError({ from: "2026-10-02", to: "2026-10-01" }), "시작일은 종료일보다 늦을 수 없습니다.");
assert.equal(getActivityFilterError({ from: "2026-10-01", to: "2026-10-01" }), "");
assert.deepEqual(getDefaultActivityFilter(new Date("2026-09-30T16:00:00Z")), { from: "2026-09-25", to: "2026-10-01", query: "", role: "" });
for (const [path, method, type] of [
  ["/student/common/cancel/1", "PATCH", "CONSULTATION_CANCELLED"],
  ["/teacher/course/allow/1", "PATCH", "CONSULTATION_APPROVED"],
  ["/teacher/common/reject/2", "PATCH", "CONSULTATION_REJECTED"],
  ["/teacher/course/unlock", "POST", "CONSULTATION_SLOTS_CHANGED"],
  ["/student/form/3/submission", "PUT", "FORM_RESUBMITTED"],
  ["/teacher/form/3/publish", "POST", "FORM_PUBLISHED"],
  ["/teacher/form/3/submission/4/confirm", "DELETE", "SUBMISSION_UNCONFIRMED"],
  ["/teacher/recruit/analyze", "POST", "RECRUIT_ANALYZED"],
  ["/teacher/recruit/3/publish", "POST", "RECRUIT_PUBLISHED"],
  ["/teacher/banner", "POST", "BANNER_UPDATED"],
  ["/auth/profile/image", "PATCH", "PROFILE_IMAGE_UPDATED"],
  ["/admin/students/sync", "POST", "STUDENTS_SYNCED"],
] as const) assert.equal(getActionActivity(path, method)?.type, type);

const activityCalls: Array<[string, RequestInit | undefined]> = [];
const usersResponse = { summary: { activeUsers: 1, pageViews: 2, actions: 3 }, users: { items: [{ userId: 4, name: "학생", studentNumber: "1101", role: "STUDENT", pageViews: 2, actions: 3, lastActiveAt: "2026-10-01T01:00:00Z" }], page: 0, totalPages: 1, totalElements: 1 } };
const eventResponse = { items: [{ id: "event-1", type: "PAGE_VIEW", path: "/forms/12", occurredAt: "2026-10-01T01:00:00Z", durationMs: null }], page: 0, totalPages: 1, totalElements: 1 };
const activityApi = createActivityApi(async <T>(path: string, init?: RequestInit) => {
  activityCalls.push([path, init]);
  return (path.includes("/events?") ? eventResponse : usersResponse) as T;
});
const filter = { from: "2026-09-25", to: "2026-10-01", query: "학생 & 교사", role: "" as const };
assert.deepEqual(await activityApi.getUsers(filter, 0), usersResponse);
const query = new URL(activityCalls[0][0], "https://example.test").searchParams;
assert.equal(query.get("query"), filter.query);
assert.equal(query.get("size"), "20");
assert.equal(query.has("role"), false);
assert.deepEqual(await activityApi.getEvents(4, filter, "PAGE_VIEW", 0), eventResponse);
assert.match(activityCalls[1][0], /^\/admin\/activity\/users\/4\/events\?/);
await assert.rejects(activityApi.getEvents(-1, filter, "", 0), /사용자/);
await assert.rejects(activityApi.getUsers(filter, -1), /페이지/);
const malformedApi = createActivityApi(async <T>() => ({ summary: { activeUsers: -1 }, users: [] }) as T);
await assert.rejects(malformedApi.getUsers(filter, 0), /응답 형식/);

let recorded = 0;
let userId: number | null = 4;
const tracked = createActivityTrackingRequest(async <T>() => "ok" as T, () => { recorded += 1; }, () => userId, true);
assert.equal(await tracked("/student/form/2/submission", { method: "POST", body: JSON.stringify({ answers: "private" }) }), "ok");
assert.equal(recorded, 1);

let attempts = 0;
let reissues = 0;
let retryRecords = 0;
const retriedRequest = createAuthenticatedRequest({
  request: async <T>() => {
    attempts += 1;
    if (attempts === 1) throw new ApiError("만료", 401);
    return "retried" as T;
  },
  readAccessToken: () => "access",
  getRefreshToken: () => "refresh",
  reissueSession: async () => { reissues += 1; },
  clearSession: () => assert.fail("성공한 재발급은 세션을 지우면 안 된다."),
});
const trackedRetry = createActivityTrackingRequest(retriedRequest, () => { retryRecords += 1; }, () => 4, true);
assert.equal(await trackedRetry("/student/course", { method: "POST" }), "retried");
assert.equal(attempts, 2);
assert.equal(reissues, 1);
assert.equal(retryRecords, 1);
await tracked("/student/form/2/submission");
assert.equal(recorded, 1);
const failed = createActivityTrackingRequest(async () => { throw new Error("실패"); }, () => { recorded += 1; }, () => userId, true);
await assert.rejects(failed("/student/course", { method: "POST" }), /실패/);
assert.equal(recorded, 1);
const switched = createActivityTrackingRequest(async <T>() => { userId = 9; return "ok" as T; }, () => { recorded += 1; }, () => userId, true);
await switched("/student/course", { method: "POST" });
assert.equal(recorded, 1);
const disabled = createActivityTrackingRequest(async <T>() => "ok" as T, () => { recorded += 1; }, () => userId, false);
await disabled("/student/course", { method: "POST" });
assert.equal(recorded, 1);

const storage = new Map<string, string>([["jobdam_access_token", "test-token"]]);
Object.defineProperty(globalThis, "window", { value: globalThis });
Object.defineProperty(globalThis, "localStorage", { value: { getItem: (key: string) => storage.get(key) ?? null } });
Object.defineProperty(globalThis, "sessionStorage", { value: { getItem: () => null } });
process.env.NEXT_PUBLIC_ACTIVITY_API_ENABLED = "true";
const { recordPageView, recordActivity } = await import("../../src/fsd/entities/user/api/recordActivity.ts");
const originalFetch = globalThis.fetch;
const originalWarn = console.warn;
const sends: Array<{ path: string; init?: RequestInit }> = [];
let warnings = 0;
console.warn = () => { warnings += 1; };
try {
  globalThis.fetch = async (input, init) => { sends.push({ path: String(input), init }); return new Response(null, { status: 204 }); };
  recordPageView("/forms/12?token=private");
  recordPageView("/login");
  assert.equal(sends.length, 1);
  assert.match(sends[0].path, /\/activity\/events$/);
  const payload = JSON.parse(String(sends[0].init?.body));
  assert.deepEqual(Object.keys(payload).sort(), ["durationMs", "eventId", "occurredAt", "path", "type"]);
  assert.equal(payload.path, "/forms/12");
  assert.equal(new Headers(sends[0].init?.headers).get("Authorization"), "Bearer test-token");
  globalThis.fetch = async () => new Response("연동 전", { status: 401 });
  recordActivity({ type: "FORM_SUBMITTED", path: "/student/form/12/submission" }, 42);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(warnings, 1);
  assert.equal(storage.get("jobdam_access_token"), "test-token");
  const throwingRecorder = createActivityTrackingRequest(async <T>() => "ok" as T, () => { throw new Error("기록 실패"); }, () => 4, true);
  assert.equal(await throwingRecorder("/student/course", { method: "POST" }), "ok");
  assert.equal(warnings, 2);
} finally {
  globalThis.fetch = originalFetch;
  console.warn = originalWarn;
}

const records = read("src/fsd/pages/admin/ui/ActivityRecords.tsx");
assert.match(page, /ActivityRecords/);
assert.match(records, /AbortController/);
assert.match(records, /기록 조회 기능이 아직 연결되지 않았습니다/);
