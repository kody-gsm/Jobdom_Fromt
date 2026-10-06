import assert from "node:assert/strict";
import { ApiError } from "../../src/fsd/shared/api/ApiError.ts";
import { createAuthenticatedRequest } from "../../src/fsd/shared/api/createAuthenticatedRequest.ts";
import { request as rawRequest } from "../../src/fsd/shared/api/client.ts";
import { createActivityTrackingRequest } from "../../src/fsd/entities/user/api/createActivityTrackingRequest.ts";

const calls: string[] = [];
let accessToken = "old-token";
let refreshToken = "refresh-token";
let shouldExpireNextRequest = true;
const usedRefreshTokens: string[] = [];

const request = createAuthenticatedRequest({
  request: async <T>(_path: string, _init: RequestInit | undefined, options: { accessToken?: string | null } | undefined) => {
    calls.push(`request:${options?.accessToken ?? "none"}`);
    if (shouldExpireNextRequest) {
      shouldExpireNextRequest = false;
      throw new ApiError("expired", 401);
    }
    return "ok" as unknown as T;
  },
  readAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
  reissueSession: async (currentRefreshToken) => {
    usedRefreshTokens.push(currentRefreshToken);
    calls.push(`reissue:${currentRefreshToken}`);
    accessToken = `new-token-${usedRefreshTokens.length}`;
    refreshToken = `new-refresh-${usedRefreshTokens.length}`;
  },
  clearSession: () => calls.push("clear"),
});

assert.equal(await request<string>("/student/course"), "ok");
assert.deepEqual(calls, ["request:old-token", "reissue:refresh-token", "request:new-token-1"]);

shouldExpireNextRequest = true;
assert.equal(await request<string>("/auth/profile"), "ok");
assert.deepEqual(usedRefreshTokens, ["refresh-token", "new-refresh-1"]);
assert.deepEqual(calls.slice(3), ["request:new-token-1", "reissue:new-refresh-1", "request:new-token-2"]);

const bytes = new Uint8Array([0, 255, 128, 80, 75, 10]);
const authorizations: Array<string | null> = [];
let downloadToken = "expired-download-token";
let downloadReissues = 0;
globalThis.fetch = (async (input, init) => {
  assert.equal(String(input), "/backend/form/file/55");
  assert.equal("responseType" in (init ?? {}), false);
  const token = new Headers(init?.headers).get("Authorization");
  authorizations.push(token);
  if (token === "Bearer expired-download-token") {
    return new Response(JSON.stringify({ code: "UNAUTHORIZED", message: "토큰이 만료되었습니다." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(bytes, { headers: { "Content-Type": "application/zip" } });
}) as typeof fetch;
const authenticatedDownload = createAuthenticatedRequest({
  request: rawRequest,
  readAccessToken: () => downloadToken,
  getRefreshToken: () => "refresh-download-token",
  reissueSession: async () => { downloadReissues += 1; downloadToken = "fresh-download-token"; },
  clearSession: () => assert.fail("successful download retry must preserve the session"),
});
const trackedDownload = createActivityTrackingRequest(authenticatedDownload, () => assert.fail("download GET must not be recorded as an action"), () => 4, true);
const downloaded = await trackedDownload<Blob>("/form/file/55", { responseType: "blob" });
assert.ok(downloaded instanceof Blob);
assert.deepEqual(new Uint8Array(await downloaded.arrayBuffer()), bytes);
assert.equal(downloadReissues, 1);
assert.deepEqual(authorizations, ["Bearer expired-download-token", "Bearer fresh-download-token"]);
const untrackedDownload = createActivityTrackingRequest(authenticatedDownload, () => assert.fail("disabled tracking must not record"), () => 4, false);
assert.deepEqual(new Uint8Array(await (await untrackedDownload<Blob>("/form/file/55", { responseType: "blob" })).arrayBuffer()), bytes);

for (const status of [403, 404]) {
  globalThis.fetch = (async () => new Response(JSON.stringify({ code: `FILE_${status}`, message: "첨부 파일 오류" }), {
    status,
    headers: { "Content-Type": "application/json" },
  })) as typeof fetch;
  await assert.rejects(trackedDownload<Blob>("/form/file/55", { responseType: "blob" }),
    (error) => error instanceof ApiError && error.status === status && error.code === `FILE_${status}` && error.message === "첨부 파일 오류");
}
assert.equal(downloadReissues, 1, "permission and missing-file errors must not refresh the session");

for (const retryStatus of [403, 404]) {
  downloadToken = "expired-download-token";
  let downloadAttempts = 0;
  globalThis.fetch = (async () => {
    downloadAttempts += 1;
    const status = downloadAttempts === 1 ? 401 : retryStatus;
    return new Response(JSON.stringify({ code: `FILE_${status}`, message: "첨부 파일 오류" }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  await assert.rejects(trackedDownload<Blob>("/form/file/55", { responseType: "blob" }),
    (error) => error instanceof ApiError && error.status === retryStatus && error.code === `FILE_${retryStatus}`);
  assert.equal(downloadAttempts, 2, "permission and missing-file errors after refresh must reach the caller without clearing the session");
}
assert.equal(downloadReissues, 3);
