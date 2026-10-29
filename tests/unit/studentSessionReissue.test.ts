import assert from "node:assert/strict";
import { test } from "node:test";
import * as storage from "../../src/fsd/entities/user/model/session.ts";
import * as lifecycle from "../../src/fsd/entities/user/model/lifecycle.ts";
import { createActivityTrackingRequest } from "../../src/fsd/entities/user/api/createActivityTrackingRequest.ts";
import { ApiError } from "../../src/fsd/shared/api/ApiError.ts";
import { createAuthenticatedRequest } from "../../src/fsd/shared/api/createAuthenticatedRequest.ts";
import type { ApiRequestInit } from "../../src/fsd/shared/api/client.ts";
import type { AuthSession } from "../../src/fsd/entities/user/model/types.ts";
import { deferred, installAuthBrowser, loadAuthModule, settleAuthTasks } from "./studentAuthTestHarness.ts";

const auth = (userId = 1): AuthSession => ({
  accessToken: `access-${userId}`, refreshToken: `refresh-${userId}`, tokenType: "Bearer",
  userId, email: `s${userId}@gsm.hs.kr`, name: `Student ${userId}`, role: "STUDENT",
});

type SessionDependencies = {
  reissueSession: (token: string) => Promise<void>;
  getSessionVersion?: () => number;
};

const reissueBoundary = (response: Promise<AuthSession>) => {
  let dependencies!: SessionDependencies;
  loadAuthModule("src/fsd/entities/user/api/sessionRequest.ts", {
    "@fsd/shared/api": {
      ApiError,
      request: async (path: string, init: RequestInit) => {
        assert.equal(path, "/auth/reissue");
        assert.equal(init.method, "POST");
        assert.deepEqual(JSON.parse(String(init.body)), { refreshToken: "refresh-1" });
        return response;
      },
      createAuthenticatedRequest: (value: SessionDependencies) => {
        dependencies = value;
        return async () => undefined;
      },
    },
    "../model/session.ts": storage,
    "../model/lifecycle.ts": lifecycle,
    "./createActivityTrackingRequest.ts": { createActivityTrackingRequest },
    "./recordActivity.ts": { ACTIVITY_API_ENABLED: false, recordActivity() {} },
  });
  return dependencies;
};

const realSessionRequest = (request: Parameters<typeof createAuthenticatedRequest>[0]["request"]) =>
  loadAuthModule<typeof import("../../src/fsd/entities/user/api/sessionRequest.ts")>("src/fsd/entities/user/api/sessionRequest.ts", {
    "@fsd/shared/api": { ApiError, request, createAuthenticatedRequest },
    "../model/session.ts": storage,
    "../model/lifecycle.ts": lifecycle,
    "./createActivityTrackingRequest.ts": { createActivityTrackingRequest },
    "./recordActivity.ts": { ACTIVITY_API_ENABLED: false, recordActivity() {} },
  }).requestWithSession;

for (const supersede of ["replacement", "logout", "same-token replacement"] as const) {
  test(`common reissue never saves an obsolete response after ${supersede}`, async () => {
    const browser = installAuthBrowser();
    try {
      lifecycle.saveSession(auth(), true);
      const response = deferred<AuthSession>();
      const dependencies = reissueBoundary(response.promise);
      const pending = dependencies.reissueSession("refresh-1").catch((error: unknown) => error);
      if (supersede === "logout") lifecycle.clearSession();
      else lifecycle.saveSession(auth(supersede === "replacement" ? 2 : 1), true);
      const expected = lifecycle.getSession();
      response.resolve({ ...auth(), accessToken: "rotated-access", refreshToken: "rotated-refresh" });
      const error = await pending;
      assert.deepEqual(lifecycle.getSession(), expected);
      assert.ok(error instanceof ApiError, "superseded refresh must stop the generic retry");
      assert.equal(error.status, 0);
    } finally { browser.restore(); }
  });
}

test("common reissue rotates tokens without replacing the session version or remember preference", async () => {
  const browser = installAuthBrowser();
  try {
    lifecycle.saveSession(auth(), true);
    const response = deferred<AuthSession>();
    const dependencies = reissueBoundary(response.promise);
    assert.equal(typeof dependencies.getSessionVersion, "function");
    const version = dependencies.getSessionVersion!();
    const pending = dependencies.reissueSession("refresh-1");
    response.resolve({ ...auth(), accessToken: "rotated-access", refreshToken: "rotated-refresh" });
    await pending;
    assert.equal(lifecycle.getSession()?.accessToken, "rotated-access");
    assert.equal(dependencies.getSessionVersion!(), version);
    assert.equal(storage.readRememberLoginPreference().enabled, true);
    lifecycle.saveSession(auth(), true);
    assert.notEqual(dependencies.getSessionVersion!(), version, "manual save replaces the session even with identical tokens");
    const manualVersion = dependencies.getSessionVersion!();
    lifecycle.clearSession();
    assert.notEqual(dependencies.getSessionVersion!(), manualVersion);
  } finally { browser.restore(); }
});

test("common reissue respects a remember preference changed while the response is pending", async () => {
  const browser = installAuthBrowser();
  try {
    lifecycle.saveSession(auth(), true);
    const response = deferred<AuthSession>();
    const dependencies = reissueBoundary(response.promise);
    const pending = dependencies.reissueSession("refresh-1");
    storage.clearRememberLoginPreference();
    response.resolve({ ...auth(), accessToken: "rotated-access", refreshToken: "rotated-refresh" });
    await pending;
    assert.equal(storage.readRememberLoginPreference().enabled, false);
  } finally { browser.restore(); }
});

test("avatar API scopes invalidation to the profile domain while retaining multipart PATCH", async () => {
  const calls: Array<{ path: string; init: RequestInit & { invalidateCache?: readonly string[] } }> = [];
  const { uploadProfileAvatar } = loadAuthModule<typeof import("../../src/fsd/features/change-profile-avatar/api/uploadProfileAvatar.ts")>("src/fsd/features/change-profile-avatar/api/uploadProfileAvatar.ts", {
    "@fsd/entities/user": {
      requestWithSession: async (path: string, init: RequestInit) => {
        calls.push({ path, init });
        return { profileImageUrl: "https://images.test/avatar.png" };
      },
      resolveProfileImageUrl: (url: string) => url,
    },
  });
  const image = new File(["image"], "avatar.png", { type: "image/png" });
  assert.equal(await uploadProfileAvatar(image), "https://images.test/avatar.png");
  assert.equal(calls[0].path, "/auth/profile/image");
  assert.equal(calls[0].init.method, "PATCH");
  assert.ok(calls[0].init.body instanceof FormData);
  assert.equal(calls[0].init.body.get("image"), image);
  assert.deepEqual(calls[0].init.invalidateCache, ["/auth/profile"]);
});

test("wired authenticated request reissues and retries with fresh tokens in the same session", async () => {
  const browser = installAuthBrowser();
  try {
    lifecycle.saveSession(auth(), true);
    const calls: string[] = [];
    const request = realSessionRequest(async <T>(path: string, _init?: ApiRequestInit, options?: { accessToken?: string | null }): Promise<T> => {
      calls.push(`${path}:${options?.accessToken ?? "none"}`);
      if (path === "/auth/reissue") return { ...auth(), accessToken: "fresh-access", refreshToken: "fresh-refresh" } as T;
      if (options?.accessToken === "access-1") throw new ApiError("expired", 401);
      return { userId: 1 } as T;
    });
    assert.deepEqual(await request("/unit/profile", { cache: "no-store" }), { userId: 1 });
    assert.deepEqual(calls, ["/unit/profile:access-1", "/auth/reissue:none", "/unit/profile:fresh-access"]);
    assert.equal(lifecycle.getSession()?.accessToken, "fresh-access");
  } finally { browser.restore(); }
});

test("wired authenticated request never retries old work as a new login after delayed reissue", async () => {
  const browser = installAuthBrowser();
  try {
    lifecycle.saveSession(auth(), true);
    const reissue = deferred<AuthSession>();
    const calls: string[] = [];
    const request = realSessionRequest(async <T>(path: string, _init?: ApiRequestInit, options?: { accessToken?: string | null }): Promise<T> => {
      calls.push(`${path}:${options?.accessToken ?? "none"}`);
      if (path === "/auth/reissue") return await reissue.promise as T;
      throw new ApiError("expired", 401);
    });
    const pending = request("/unit/profile", { cache: "no-store" }).catch((error: unknown) => error);
    await settleAuthTasks();
    lifecycle.saveSession(auth(2), true);
    reissue.resolve({ ...auth(), accessToken: "stale-access", refreshToken: "stale-refresh" });
    const error = await pending;
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 0);
    assert.equal(lifecycle.getSession()?.userId, 2);
    assert.deepEqual(calls, ["/unit/profile:access-1", "/auth/reissue:none"]);
  } finally { browser.restore(); }
});

test("wired authenticated request never retries an obsolete 401 as an account replaced in another tab", async () => {
  const browser = installAuthBrowser();
  try {
    lifecycle.saveSession(auth(), true);
    const original = deferred<unknown>();
    const calls: Array<string | null | undefined> = [];
    const request = realSessionRequest(async <T>(_path: string, _init?: ApiRequestInit, options?: { accessToken?: string | null }): Promise<T> => {
      calls.push(options?.accessToken);
      if (options?.accessToken === "access-1") return await original.promise as T;
      return { userId: 2 } as T;
    });
    const pending = request("/unit/profile", { cache: "no-store" }).catch((error: unknown) => error);
    // A storage update from another tab does not call this tab's lifecycle code.
    browser.window.localStorage.setItem("jobdam_access_token", "access-2");
    browser.window.localStorage.setItem("jobdam_session", JSON.stringify(auth(2)));
    original.reject(new ApiError("expired", 401));
    const error = await pending;
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 401);
    assert.deepEqual(calls, ["access-1"]);
    assert.equal(lifecycle.getSession()?.userId, 2);
  } finally { browser.restore(); }
});
