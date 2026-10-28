import assert from "node:assert/strict";
import { createRequestCache } from "../../src/fsd/shared/lib/requestCache.ts";

let now = 1_000;
const cache = createRequestCache(() => now);
let calls = 0;

const load = async () => {
  calls += 1;
  return { calls };
};

const first = await cache.getOrFetch("student-1:/recruit", load, 1_000);
const second = await cache.getOrFetch("student-1:/recruit", load, 1_000);
assert.deepEqual(first, { calls: 1 });
assert.deepEqual(second, { calls: 1 });
assert.equal(calls, 1);

const [inFlightFirst, inFlightSecond] = await Promise.all([
  cache.getOrFetch("student-1:/forms", load, 1_000),
  cache.getOrFetch("student-1:/forms", load, 1_000),
]);
assert.deepEqual(inFlightFirst, { calls: 2 });
assert.deepEqual(inFlightSecond, { calls: 2 });
assert.equal(calls, 2);

now += 1_001;
assert.deepEqual(await cache.getOrFetch("student-1:/recruit", load, 1_000), { calls: 3 });
assert.equal(calls, 3);

cache.clear("student-1:");
assert.deepEqual(await cache.getOrFetch("student-1:/forms", load, 1_000), { calls: 4 });
assert.equal(calls, 4);

let resolvePending: ((value: { calls: number }) => void) | undefined;
const pending = new Promise<{ calls: number }>((resolve) => {
  resolvePending = resolve;
});
const pendingRequest = cache.getOrFetch("student-1:/pending", () => pending, 1_000);
cache.clear("student-1:/pending");
resolvePending?.({ calls: 5 });
await pendingRequest;
assert.deepEqual(
  await cache.getOrFetch("student-1:/pending", async () => ({ calls: 6 }), 1_000),
  { calls: 6 },
);

console.log("request cache tests passed");
