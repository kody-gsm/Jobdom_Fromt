import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ApiError } from "../../src/fsd/shared/api/ApiError.ts";
import { createAuthenticatedRequest } from "../../src/fsd/shared/api/createAuthenticatedRequest.ts";

let cleared = 0;
const permissionRequest = createAuthenticatedRequest({
  request: async <T>() => { throw new ApiError("forbidden", 403) as unknown as T; },
  readAccessToken: () => "token",
  getRefreshToken: () => "refresh",
  reissueSession: async () => undefined,
  clearSession: () => { cleared += 1; },
});
await assert.rejects(() => permissionRequest("/student/teacher-only"), (error: unknown) =>
  error instanceof ApiError && error.status === 403,
);
assert.equal(cleared, 0);

const expiredRequest = createAuthenticatedRequest({
  request: async <T>() => { throw new ApiError("expired", 401) as unknown as T; },
  readAccessToken: () => "token",
  getRefreshToken: () => null,
  reissueSession: async () => undefined,
  clearSession: () => { cleared += 1; },
});
await assert.rejects(() => expiredRequest("/student/profile"));
assert.equal(cleared, 1);

const tabs = readFileSync(
  resolve(process.cwd(), "src/fsd/shared/ui/SegmentedTabs.tsx"),
  "utf8",
);
assert.match(tabs, /onKeyDown/);
assert.match(tabs, /tabIndex/);
assert.match(tabs, /ArrowLeft|ArrowRight/);
assert.match(tabs, /Home/);
assert.match(tabs, /End/);
assert.match(tabs, /aria-controls/);

console.log("student auth status and tabs contract passed");
