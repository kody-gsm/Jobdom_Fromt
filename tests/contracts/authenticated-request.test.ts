import assert from "node:assert/strict";
import { ApiError } from "../../src/fsd/shared/api/ApiError.ts";
import { createAuthenticatedRequest } from "../../src/fsd/shared/api/createAuthenticatedRequest.ts";

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
