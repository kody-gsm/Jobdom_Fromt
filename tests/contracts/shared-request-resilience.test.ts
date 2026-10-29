import assert from "node:assert/strict";
import { createAuthenticatedRequest } from "../../src/fsd/shared/api/createAuthenticatedRequest.ts";
import { request } from "../../src/fsd/shared/api/client.ts";
import { ApiError } from "../../src/fsd/shared/api/ApiError.ts";
import { authenticatedGetCache, createRequestCache } from "../../src/fsd/shared/lib/requestCache.ts";
import { createConsultationApi } from "../../src/fsd/entities/consultation/api/createConsultationApi.ts";
import { createRecruitApi } from "../../src/fsd/entities/recruit/api/createRecruitApi.ts";

authenticatedGetCache.clear();
let token = "resilience-token";
let refresh = "resilience-refresh";
const calls: string[] = [];
let resolveOld: ((value: never) => void) | undefined;
let rejectOld: ((error: Error) => void) | undefined;
const api = createAuthenticatedRequest({
  request: async <T>(path: string): Promise<T> => {
    calls.push(path);
    if (path === "/old-session") return new Promise<T>((resolve, reject) => {
      resolveOld = resolve;
      rejectOld = reject;
    });
    return calls.length as T;
  },
  readAccessToken: () => token,
  getRefreshToken: () => refresh,
  reissueSession: async () => assert.fail("obsolete request must not reissue another session"),
  clearSession: () => assert.fail("obsolete request must not clear another session"),
});
await api("/student/course");
await api("/recruit");
await api("/ticket", { method: "POST", invalidateCache: [] });
await api("/student/course");
assert.equal(calls.filter((path) => path === "/student/course").length, 1);
await api("/change", { method: "PATCH", invalidateCache: ["/student/course"] });
await api("/student/course");
await api("/recruit");
assert.equal(calls.filter((path) => path === "/student/course").length, 2);
assert.equal(calls.filter((path) => path === "/recruit").length, 1);
await api("/recruit", { cache: "no-store" });
await api("/recruit");
assert.equal(calls.filter((path) => path === "/recruit").length, 3, "fresh reload must invalidate earlier cached data");
const old = api("/old-session");
await Promise.resolve();
token = "next-session";
refresh = "next-refresh";
rejectOld?.(new ApiError("expired", 401));
await assert.rejects(old, (error) => error instanceof ApiError && error.status === 401);
assert.equal(typeof resolveOld, "function");

const consultation = createConsultationApi(api);
const recruits = createRecruitApi(api);
await consultation.getUpcoming("common");
await recruits.getAll();
const recruitCallsBefore = calls.filter((path) => path === "/recruit").length;
await consultation.cancel("common", 5);
await consultation.getUpcoming("common");
await recruits.getAll();
assert.equal(calls.filter((path) => path === "/student/common").length, 2);
assert.equal(calls.filter((path) => path === "/recruit").length, recruitCallsBefore);
await consultation.getUpcoming("common", { cache: "no-store" });
assert.equal(calls.filter((path) => path === "/student/common").length, 3);

let sessionVersion = 1;
let finishReissue: (() => void) | undefined;
let protectedCalls = 0;
const reissuing = createAuthenticatedRequest({
  request: async <T>(): Promise<T> => { protectedCalls += 1; throw new ApiError("expired", 401); },
  readAccessToken: () => token,
  getRefreshToken: () => refresh,
  getSessionVersion: () => sessionVersion,
  reissueSession: () => new Promise<void>((resolve) => { finishReissue = resolve; }),
  clearSession: () => assert.fail("replacement session must survive an earlier refresh"),
});
const protectedRequest = reissuing("/protected", { cache: "no-store" });
await Promise.resolve();
sessionVersion += 1;
token = "manual-login-token";
finishReissue?.();
await assert.rejects(protectedRequest, (error) => error instanceof ApiError && error.status === 401);
assert.equal(protectedCalls, 1, "a superseded operation must not retry with the replacement account");

let staleReject: ((error: Error) => void) | undefined;
let concurrentCalls = 0;
const concurrent = createAuthenticatedRequest({
  request: async <T>(): Promise<T> => {
    concurrentCalls += 1;
    if (concurrentCalls === 1) return new Promise<T>((_resolve, reject) => { staleReject = reject; });
    return "ok" as T;
  },
  readAccessToken: () => token,
  getRefreshToken: () => refresh,
  getSessionVersion: () => sessionVersion,
  reissueSession: async () => assert.fail("already rotated session needs no second refresh"),
  clearSession: () => assert.fail("rotated session must survive"),
});
const concurrentRequest = concurrent("/concurrent", { cache: "no-store" });
token = "rotated-token";
refresh = "rotated-refresh";
staleReject?.(new ApiError("expired", 401));
assert.equal(await concurrentRequest, "ok");
assert.equal(concurrentCalls, 2);

const bounded = createRequestCache(Date.now, 2);
const loads: string[] = [];
const read = (key: string) => bounded.getOrFetch(key, async () => { loads.push(key); return key; }, 1_000);
await read("a");
await read("b");
await read("a");
await read("c");
await read("b");
assert.equal(loads.filter((key) => key === "b").length, 2, "least recently used entries must be bounded");

let finishStale: ((value: string) => void) | undefined;
const stale = bounded.getOrFetch("stale", () => new Promise<string>((resolve) => { finishStale = resolve; }), 1_000);
await Promise.resolve();
bounded.clear("stale");
assert.equal(await bounded.getOrFetch("stale", async () => "fresh", 1_000), "fresh");
finishStale?.("old");
await stale;
assert.equal(await bounded.getOrFetch("stale", async () => "unexpected", 1_000), "fresh");

globalThis.fetch = (async (_input, init) => {
  assert.ok(init?.signal instanceof AbortSignal, "every request has a bounded lifetime");
  assert.equal("timeoutMs" in (init ?? {}), false);
  assert.equal("invalidateCache" in (init ?? {}), false);
  return new Response("ok");
}) as typeof fetch;
await request("/bounded", { timeoutMs: 50, invalidateCache: [] });

globalThis.fetch = (async (_input, init) => new Response(new ReadableStream({
  start(controller) {
    init?.signal?.addEventListener("abort", () => controller.error(init.signal?.reason), { once: true });
  },
}))) as typeof fetch;
await assert.rejects(request("/stalled-body", { timeoutMs: 10 }),
  (error) => error instanceof ApiError && error.code === "REQUEST_TIMEOUT");
const caller = new AbortController();
const canceled = request("/canceled", { timeoutMs: 1_000, signal: caller.signal });
caller.abort();
await assert.rejects(canceled, (error) => error instanceof ApiError && error.code === "REQUEST_ABORTED");
authenticatedGetCache.clear();
console.log("shared request resilience tests passed");
