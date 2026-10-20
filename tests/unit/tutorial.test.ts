import assert from "node:assert/strict";
import {
  getTutorialRole,
  getTutorialStorageKey,
  readTutorialCompletion,
  saveTutorialCompletion,
} from "../../src/fsd/features/role-tutorial/model/progress.ts";
import { getTutorialSteps } from "../../src/fsd/features/role-tutorial/model/steps.ts";

const values = new Map<string, string>();
const storage = {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => { values.set(key, value); },
};
const studentKey = getTutorialStorageKey(1, "STUDENT");
assert.equal(getTutorialRole("ADMIN"), null);
assert.equal(getTutorialRole(undefined), null);
assert.equal(getTutorialRole("STUDENT"), "STUDENT");
assert.equal(getTutorialRole("TEACHER"), "TEACHER");
assert.equal(getTutorialRole("WEE_TEACHER"), "WEE_TEACHER");
assert.equal(readTutorialCompletion(storage, studentKey), false);
assert.equal(saveTutorialCompletion(storage, studentKey), true);
assert.equal(readTutorialCompletion(storage, studentKey), true);
assert.equal(readTutorialCompletion(storage, getTutorialStorageKey(2, "STUDENT")), false);
assert.equal(readTutorialCompletion(storage, getTutorialStorageKey(1, "TEACHER")), false);
assert.equal(readTutorialCompletion(storage, getTutorialStorageKey(1, "WEE_TEACHER")), false);
storage.setItem(studentKey, "started");
assert.equal(readTutorialCompletion(storage, studentKey), false);

const blockedStorage = {
  getItem: (): string | null => { throw new Error("Storage blocked"); },
  setItem: () => { throw new Error("Storage blocked"); },
};
assert.equal(readTutorialCompletion(blockedStorage, studentKey), false);
assert.equal(saveTutorialCompletion(blockedStorage, studentKey), false);
assert.equal(readTutorialCompletion(null, studentKey), false);
assert.equal(saveTutorialCompletion(null, studentKey), false);

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
