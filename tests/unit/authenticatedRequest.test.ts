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

import { ApiError } from "../../src/fsd/shared/api/ApiError.ts";
import { isAccessTokenStale } from "../../src/fsd/entities/user/model/session.ts";

// 로그인 정보가 없으면 서버에 보내지 않고 401로 끝낸다. 지울 세션이 없으므로 clearSession도 부르지 않는다.
{
  let fetched = 0;
  let cleared = 0;
  const anonymous = createAuthenticatedRequest({
    request: async <T>() => { fetched += 1; return {} as T; },
    readAccessToken: () => null,
    getRefreshToken: () => null,
    reissueSession: async () => undefined,
    clearSession: () => { cleared += 1; },
    rejectWithoutCredentials: () => true,
  });
  await assert.rejects(anonymous("/unit/anonymous"), (error) => error instanceof ApiError && error.status === 401);
  assert.equal(fetched, 0);
  assert.equal(cleared, 0);
}

// 만료된 JWT는 보내기 전에 한 번만 재발급하고, 동시에 나간 요청은 그 재발급을 공유한다.
{
  const jwt = (exp: number) => `h.${btoa(JSON.stringify({ exp })).replace(/=+$/, "")}.s`;
  const now = Math.floor(Date.now() / 1000);
  let token = jwt(now - 60);
  let reissues = 0;
  const sentWith: Array<string | null | undefined> = [];
  const proactive = createAuthenticatedRequest({
    request: async <T>(_path: string, _init?: ApiRequestInit, options?: { accessToken?: string | null }) => {
      sentWith.push(options?.accessToken);
      return {} as T;
    },
    readAccessToken: () => token,
    getRefreshToken: () => "refresh",
    reissueSession: async () => {
      reissues += 1;
      await Promise.resolve();
      token = jwt(now + 900);
    },
    clearSession: () => undefined,
    isAccessTokenStale: (value) => isAccessTokenStale(value),
  });
  await Promise.all([proactive("/unit/a", { cache: "no-store" }), proactive("/unit/b", { cache: "no-store" })]);
  assert.equal(reissues, 1);
  assert.deepEqual(sentWith, [token, token]);

  // 기기 시계가 빨라 새 토큰도 만료로 보이면 같은 토큰으로 재발급을 반복하지 않는다.
  token = jwt(now - 60);
  let skewedReissues = 0;
  const skewed = createAuthenticatedRequest({
    request: async <T>() => ({}) as T,
    readAccessToken: () => token,
    getRefreshToken: () => "refresh",
    reissueSession: async () => { skewedReissues += 1; token = jwt(now - 30); },
    clearSession: () => undefined,
    isAccessTokenStale: (value) => isAccessTokenStale(value),
  });
  await skewed("/unit/c", { cache: "no-store" });
  await skewed("/unit/d", { cache: "no-store" });
  assert.equal(skewedReissues, 1);
}

// JWT로 읽히지 않는 토큰은 만료로 보지 않는다.
assert.equal(isAccessTokenStale("unit-token"), false);
assert.equal(isAccessTokenStale("a.not-base64!.c"), false);

authenticatedGetCache.clear();
console.log("authenticated request tests passed");
