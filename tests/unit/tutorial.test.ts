import assert from "node:assert/strict";
import { createTutorialApi } from "../../src/fsd/features/role-tutorial/api/createTutorialApi.ts";
import { getTutorialRole } from "../../src/fsd/features/role-tutorial/model/progress.ts";
import { getTutorialSteps } from "../../src/fsd/features/role-tutorial/model/steps.ts";
import { clipRect, getCardPosition, getDimPath, getHolesPath, mergeNearbyRects, padRect, unionRects } from "../../src/fsd/features/role-tutorial/model/spotlight.ts";

assert.equal(getTutorialRole("ADMIN"), null);
assert.equal(getTutorialRole(undefined), null);
assert.equal(getTutorialRole("STUDENT"), "STUDENT");
assert.equal(getTutorialRole("TEACHER"), "TEACHER");
assert.equal(getTutorialRole("WEE_TEACHER"), "WEE_TEACHER");

const calls: Array<[string, RequestInit | undefined]> = [];
let completed = false;
const tutorialApi = createTutorialApi(async <T>(path: string, init?: RequestInit) => {
  calls.push([path, init]);
  if (init?.method === "PATCH") completed = true;
  return { tutorialCompleted: completed } as T;
});
const controller = new AbortController();
assert.equal(await tutorialApi.isCompleted(controller.signal), false);
assert.deepEqual(calls[0], ["/auth/tutorial", { signal: controller.signal }]);
await tutorialApi.complete();
assert.deepEqual(calls[1], ["/auth/tutorial/complete", { method: "PATCH" }]);
assert.equal(await tutorialApi.isCompleted(), true);

const malformedApi = createTutorialApi(async <T>() => ({ tutorialCompleted: "true" }) as T);
await assert.rejects(malformedApi.isCompleted(), /응답 형식/);
await assert.rejects(malformedApi.complete(), /응답 형식/);
const notSavedApi = createTutorialApi(async <T>() => ({ tutorialCompleted: false }) as T);
await assert.rejects(notSavedApi.complete(), /저장되지 않았습니다/);
const failedApi = createTutorialApi(async () => { throw new Error("네트워크 오류"); });
await assert.rejects(failedApi.complete(), /네트워크 오류/);

const ROLE_ROUTES = {
  STUDENT: ["/", "/counsel", "/recruit", "/forms", "/profile"],
  TEACHER: ["/teacher", "/teacher/recruit", "/teacher/forms", "/profile"],
  WEE_TEACHER: ["/teacher", "/profile"],
} as const;

for (const role of ["STUDENT", "TEACHER", "WEE_TEACHER"] as const) {
  const steps = getTutorialSteps(role);
  assert.ok(steps.length > 4);
  assert.equal(new Set(steps.map((step) => step.id)).size, steps.length);
  assert.equal(steps[0].target, "navigation");
  // 마지막 단계는 실제 프로필의 '튜토리얼 다시 보기' 버튼을 가리킨다.
  assert.equal(steps.at(-1)?.target, "tutorial-replay");
  assert.equal(steps.at(-1)?.route, "/profile");
  assert.ok(steps.every((step) => step.title && step.description && step.target && step.route));
  // 각 역할이 실제로 접근할 수 있는 화면에서만 안내한다.
  assert.ok(steps.every((step) => (ROLE_ROUTES[role] as readonly string[]).includes(step.route)), role);
  if (role !== "STUDENT") assert.ok(steps.some((step) => step.id === "banner"));
}

const weeSteps = getTutorialSteps("WEE_TEACHER");
assert.match(weeSteps[0].title, /Wee클래스/);
assert.ok(!weeSteps.some((step) => step.route === "/teacher/recruit" || step.route === "/teacher/forms"));

const consultationSteps = getTutorialSteps("STUDENT").filter((step) => step.route === "/counsel");
assert.equal(consultationSteps.at(-1)?.target, "consultation-submit");
assert.equal(consultationSteps.length, 5);

assert.deepEqual(unionRects([]), null);
assert.deepEqual(
  unionRects([{ top: 100, left: 20, width: 200, height: 40 }, { top: 160, left: 10, width: 100, height: 60 }]),
  { top: 100, left: 10, width: 210, height: 120 },
);
assert.deepEqual(padRect({ top: 100, left: 20, width: 200, height: 40 }, 8), { top: 92, left: 12, width: 216, height: 56 });

const viewport = { width: 1280, height: 800 };
const card = { width: 360, height: 280 };
assert.equal(getCardPosition(null, card, viewport).placement, "center");
// 설명 카드는 강조 영역과 겹치지 않는 쪽에 놓인다.
const overlaps = (a: { top: number; left: number; width: number; height: number }, b: typeof a) =>
  a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height;
for (const target of [
  { top: 80, left: 400, width: 480, height: 60 },
  { top: 600, left: 400, width: 480, height: 120 },
  { top: 96, left: 40, width: 600, height: 680 },
  { top: 96, left: 640, width: 600, height: 680 },
]) {
  const position = getCardPosition(target, card, viewport);
  assert.notEqual(position.placement, "corner");
  assert.equal(overlaps({ ...position, ...card }, target), false, JSON.stringify(target));
  assert.ok(position.left >= 16 && position.left + card.width <= viewport.width - 16);
  assert.ok(position.top >= 16 && position.top + card.height <= viewport.height - 16);
}
assert.equal(getCardPosition({ top: 0, left: 0, width: 1280, height: 800 }, card, viewport).placement, "corner");

// 떨어져 있는 요소는 하나의 큰 상자로 묶지 않고 요소마다 따로 강조한다.
const separated = [{ top: 100, left: 20, width: 120, height: 40 }, { top: 100, left: 600, width: 120, height: 40 }];
assert.equal(getHolesPath(separated).match(/M/g)?.length, 2);
assert.equal(getHolesPath([]), "");
const dimPath = getDimPath(separated, viewport);
assert.ok(dimPath.startsWith("M0 0H1280V800H0Z"));
assert.equal(dimPath.match(/M/g)?.length, 3);
assert.equal(getDimPath([], viewport), "M0 0H1280V800H0Z");

// 거의 맞닿은 요소(여백 포함 12px 이내)만 하나로 합치고, 멀리 떨어진 요소는 그대로 둔다.
assert.deepEqual(
  mergeNearbyRects([{ top: 100, left: 20, width: 500, height: 96 }, { top: 200, left: 20, width: 500, height: 86 }]),
  [{ top: 100, left: 20, width: 500, height: 186 }],
);
assert.equal(mergeNearbyRects(separated).length, 2);
assert.equal(mergeNearbyRects([{ top: 0, left: 0, width: 10, height: 10 }, { top: 0, left: 20, width: 10, height: 10 }, { top: 0, left: 40, width: 10, height: 10 }]).length, 1);

// 화면 밖으로 나간 부분은 잘라서 보이는 만큼만 강조한다.
assert.deepEqual(clipRect({ top: -100, left: 10, width: 200, height: 1200 }, viewport), { top: 0, left: 10, width: 200, height: 800 });
assert.equal(clipRect({ top: 900, left: 10, width: 200, height: 100 }, viewport), null);

console.log("tutorial tests passed");
