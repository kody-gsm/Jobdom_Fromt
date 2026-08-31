import assert from "node:assert/strict";

process.env.NEXT_PUBLIC_API_BASE_URL = "/backend";
const storage = new Map<string, string>();
Object.defineProperty(globalThis, "window", { value: globalThis });
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
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

localStorage.setItem("jobdam_access_token", "test-access-token");
await api.getRecruits();
localStorage.removeItem("jobdam_access_token");
await api.getForms();
await api.getStudentConsultations("course");
await api.getTeacherConsultations("common");
await api.sendSignupVerificationCode("s123@gsm.hs.kr");
await api.signup({ email: "s123@gsm.hs.kr", password: "Password!1", verificationCode: "123456" });
await api.resetPassword("s123@gsm.hs.kr", "123456", "Password!2");

assert.deepEqual(calls.map(({ url, method }) => [url, method]), [
  ["/backend/recruit", "GET"],
  ["/backend/form", "GET"],
  ["/backend/student/course", "GET"],
  ["/backend/teacher/common", "GET"],
  ["/backend/auth/email/signup-code", "POST"],
  ["/backend/auth/signup", "POST"],
  ["/backend/auth/password/reset", "POST"],
]);
assert.deepEqual(JSON.parse(calls[5].body || "{}"), { email: "s123@gsm.hs.kr", password: "Password!1", verificationCode: "123456" });
assert.deepEqual(JSON.parse(calls[6].body || "{}"), { email: "s123@gsm.hs.kr", verificationCode: "123456", newPassword: "Password!2" });
assert.equal(calls[0].authorization, "Bearer test-access-token");

globalThis.fetch = (async () => new Response("Internal Server Error", { status: 500 })) as typeof fetch;
await assert.rejects(api.getRecruits(), (error) =>
  error instanceof api.ApiError && error.status === 500 && error.message === "백엔드 서버에 연결할 수 없습니다."
);
