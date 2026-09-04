import assert from "node:assert/strict";
import { ApiError } from "../../src/fsd/shared/api/ApiError.ts";
import { createAuthenticatedRequest } from "../../src/fsd/shared/api/createAuthenticatedRequest.ts";

const calls: string[] = [];
let accessToken = "old-token";
let first = true;

const request = createAuthenticatedRequest({
  request: async (_path, _init, options) => {
    calls.push(`request:${options?.accessToken ?? "none"}`);
    if (first) {
      first = false;
      throw new ApiError("expired", 401);
    }
    return "ok";
  },
  readAccessToken: () => accessToken,
  getRefreshToken: () => "refresh-token",
  reissueSession: async () => {
    calls.push("reissue");
    accessToken = "new-token";
  },
  clearSession: () => calls.push("clear"),
});

assert.equal(await request<string>("/student/course"), "ok");
assert.deepEqual(calls, ["request:old-token", "reissue", "request:new-token"]);
