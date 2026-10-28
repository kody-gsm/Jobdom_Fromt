import assert from "node:assert/strict";
import { createAuthenticatedRequest } from "../../src/fsd/shared/api/createAuthenticatedRequest.ts";
import type { ApiRequestInit } from "../../src/fsd/shared/api/client.ts";
import { authenticatedGetCache } from "../../src/fsd/shared/lib/requestCache.ts";

authenticatedGetCache.clear();
let calls = 0;
const request = async <T>(path: string, init?: ApiRequestInit): Promise<T> => {
  assert.ok(path.startsWith("/unit/"));
  assert.ok(init === undefined || typeof init === "object");
  calls += 1;
  return { calls } as T;
};
const authenticatedRequest = createAuthenticatedRequest({
  request,
  readAccessToken: () => "unit-token",
  getRefreshToken: () => null,
  reissueSession: async () => undefined,
  clearSession: () => undefined,
});

await authenticatedRequest("/unit/cacheable");
await authenticatedRequest("/unit/cacheable");
assert.equal(calls, 1);

await authenticatedRequest("/unit/cacheable", { cache: "no-store" });
await authenticatedRequest("/unit/cacheable", { cache: "no-store" });
assert.equal(calls, 3);

authenticatedGetCache.clear();
console.log("authenticated request tests passed");
