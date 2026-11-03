import assert from "node:assert/strict";
import { getStatusRetryKey, getTutorialMode } from "../../src/fsd/features/role-tutorial/model/presentation.ts";

// 상태를 모르거나 완료·조회 실패면 안내 없이 실제 화면만 보여준다.
assert.equal(getTutorialMode(null, false), null);
assert.equal(getTutorialMode("completed", false), null);
assert.equal(getTutorialMode("failed", false), null);
assert.equal(getTutorialMode("pending", false), "first-run");

// 프로필의 다시 보기는 완료 여부와 관계없이 안내를 연다. 미완료라면 완료 저장이 우선이다.
assert.equal(getTutorialMode("completed", true), "replay");
assert.equal(getTutorialMode("failed", true), "replay");
assert.equal(getTutorialMode(null, true), "replay");
assert.equal(getTutorialMode("pending", true), "first-run");

// 조회 실패는 화면을 이동할 때마다 다시 확인하고, 성공한 결과는 이동해도 다시 조회하지 않는다.
assert.equal(getStatusRetryKey("failed", "/recruit"), "/recruit");
assert.notEqual(getStatusRetryKey("failed", "/"), getStatusRetryKey("failed", "/recruit"));
assert.equal(getStatusRetryKey("pending", "/recruit"), getStatusRetryKey("pending", "/"));
assert.equal(getStatusRetryKey("completed", "/recruit"), "");
assert.equal(getStatusRetryKey(null, "/recruit"), "");

console.log("role tutorial presentation tests passed");
