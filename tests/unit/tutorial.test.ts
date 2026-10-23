import assert from "node:assert/strict";
import { createTutorialApi } from "../../src/fsd/features/role-tutorial/api/createTutorialApi.ts";
import { getTutorialRole } from "../../src/fsd/features/role-tutorial/model/progress.ts";
import { getTutorialSteps } from "../../src/fsd/features/role-tutorial/model/steps.ts";

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

for (const role of ["STUDENT", "TEACHER", "WEE_TEACHER"] as const) {
  const steps = getTutorialSteps(role);
  assert.ok(steps.length > 4);
  assert.equal(new Set(steps.map((step) => step.id)).size, steps.length);
  assert.equal(steps[0].target, "navigation");
  assert.equal(steps.at(-1)?.target, "account");
  assert.ok(steps.every((step) => step.title && step.description && step.target));
  if (role === "WEE_TEACHER") {
    assert.ok(steps.every((step) => ["teacher-schedule", "teacher-request"].includes(step.scene)));
  }
}

const studentSteps = getTutorialSteps("STUDENT");
const consultationSteps = studentSteps.filter((step) => step.scene === "consultation");
const formSteps = studentSteps.filter((step) => step.scene === "student-form");
assert.equal(consultationSteps.at(-1)?.target, "consultation-submit");
assert.equal(formSteps.at(-1)?.target, "form-submit");
assert.ok(formSteps.length >= 2);
console.log("tutorial tests passed");
