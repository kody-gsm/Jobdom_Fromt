import assert from "node:assert/strict";

process.env.NEXT_PUBLIC_API_BASE_URL = "/backend";
const storage = new Map<string, string>();
const sessionStorageData = new Map<string, string>();
Object.defineProperty(globalThis, "window", { value: globalThis });
Object.defineProperty(globalThis, "dispatchEvent", { value: () => true });
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});
Object.defineProperty(globalThis, "sessionStorage", {
  value: {
    getItem: (key: string) => sessionStorageData.get(key) ?? null,
    setItem: (key: string, value: string) => sessionStorageData.set(key, value),
    removeItem: (key: string) => sessionStorageData.delete(key),
  },
});

const calls: { url: string; method: string; body?: string; authorization?: string }[] = [];

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  calls.push({
    url: String(input),
    method: init?.method || "GET",
    body: init?.body as string | undefined,
    authorization: new Headers(init?.headers).get("Authorization") ?? undefined,
  });
  return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
}) as typeof fetch;

const api = await import("../app/utils/api.ts");

sessionStorage.setItem("jobdam_access_token", "test-access-token");
await api.getRecruits();
sessionStorage.removeItem("jobdam_access_token");
await api.getForms();
await api.getStudentConsultations("course");
await api.getTeacherConsultations("common");
await api.syncStudents();
await api.sendSignupVerificationCode("s123@gsm.hs.kr");
await api.signup({ email: "s123@gsm.hs.kr", password: "Password!1", verificationCode: "123456" });
await api.resetPassword("s123@gsm.hs.kr", "123456", "Password!2");

assert.deepEqual(calls.map(({ url, method }) => [url, method]), [
  ["/backend/recruit", "GET"],
  ["/backend/form", "GET"],
  ["/backend/student/course", "GET"],
  ["/backend/teacher/common", "GET"],
  ["/backend/admin/students/sync", "POST"],
  ["/backend/auth/email/signup-code", "POST"],
  ["/backend/auth/signup", "POST"],
  ["/backend/auth/password/reset", "POST"],
]);
assert.deepEqual(JSON.parse(calls[6].body || "{}"), { email: "s123@gsm.hs.kr", password: "Password!1", verificationCode: "123456" });
assert.deepEqual(JSON.parse(calls[7].body || "{}"), { email: "s123@gsm.hs.kr", verificationCode: "123456", newPassword: "Password!2" });
assert.equal(calls[0].authorization, "Bearer test-access-token");

const adminToken = `x.${btoa(JSON.stringify({ role: "ADMIN" }))}.x`;
assert.equal(api.saveSession({ accessToken: adminToken, refreshToken: "", tokenType: "Bearer", userId: 1, email: "admin@gsm.hs.kr", name: "관리자" }).role, "ADMIN");

assert.equal(api.findRecruitForm(
  { id: 1, companyName: "(주) 잡담", interviewDate: null, deadline: null, summary: null, status: "PUBLISHED", createdAt: "", updatedAt: "" },
  [{ id: 7, title: "잡담 백엔드 개발자 지원서", description: null, status: "PUBLISHED", questionCount: 3, createdAt: "" }],
)?.id, 7);
assert.equal(api.findRecruitForm(
  { id: 2, companyName: "다른회사", interviewDate: null, deadline: null, summary: null, status: "DRAFT", createdAt: "", updatedAt: "" },
  [],
), null);

globalThis.fetch = (async () => new Response("Internal Server Error", { status: 500 })) as typeof fetch;
await assert.rejects(api.getRecruits(), (error) =>
  error instanceof api.ApiError && error.status === 500 && error.message === "백엔드 서버에 연결할 수 없습니다."
);
