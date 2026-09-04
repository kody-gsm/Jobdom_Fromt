import assert from "node:assert/strict";

process.env.NEXT_PUBLIC_API_BASE_URL = "/backend";

const calls: Array<{ url: string; method: string; authorization: string | null; contentType: string | null }> = [];

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  calls.push({
    url: String(input),
    method: init?.method || "GET",
    authorization: headers.get("Authorization"),
    contentType: headers.get("Content-Type"),
  });
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}) as typeof fetch;

const { ApiError, request } = await import("../../src/fsd/shared/api/index.ts");

const result = await request<{ ok: boolean }>(
  "/health",
  { method: "POST", body: JSON.stringify({ ping: true }) },
  { accessToken: "token-123" },
);
assert.deepEqual(result, { ok: true });
assert.deepEqual(calls[0], {
  url: "/backend/health",
  method: "POST",
  authorization: "Bearer token-123",
  contentType: "application/json",
});

globalThis.fetch = (async () => new Response(null, { status: 204 })) as typeof fetch;
assert.equal(await request<void>("/empty"), undefined);

globalThis.fetch = (async () => new Response("Internal Server Error", { status: 500 })) as typeof fetch;
await assert.rejects(
  request("/broken"),
  (error) => error instanceof ApiError && error.status === 500 && error.message === "백엔드 서버에 연결할 수 없습니다.",
);

globalThis.fetch = (async () => {
  throw new Error("offline");
}) as typeof fetch;
await assert.rejects(
  request("/offline"),
  (error) => error instanceof ApiError && error.status === 0 && error.message === "백엔드 서버에 연결할 수 없습니다.",
);

const formData = new FormData();
formData.append("image", new Blob(["x"]), "x.txt");
globalThis.fetch = (async (_input, init) => {
  assert.equal(new Headers(init?.headers).has("Content-Type"), false);
  return new Response(null, { status: 204 });
}) as typeof fetch;
await request("/upload", { method: "POST", body: formData });
