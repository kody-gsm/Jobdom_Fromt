import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { afterEach, beforeEach, mock, test } from "node:test";
import { createConsultationEnvironment, deferred } from "./consultationHookHarness.mjs";
import {
  createEmptyConsultationDraft,
  getConsultationDraftStorageKey,
  readConsultationDrafts,
  writeConsultationDraft,
} from "../../src/fsd/features/submit-consultation/model/consultationDraft.ts";

const root = new URL("../../src/fsd/", import.meta.url);
const harnessUrl = new URL("./consultationHookHarness.mjs", import.meta.url).href;
const consultationExports = `export * from ${JSON.stringify(new URL("entities/consultation/model/rules.ts", root).href)};
export * from ${JSON.stringify(new URL("entities/consultation/model/schedule.ts", root).href)};
export * from ${JSON.stringify(new URL("entities/consultation/model/labels.ts", root).href)};`;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (["react", "next/navigation", "@fsd/entities/user"].includes(specifier)) {
      return { url: harnessUrl, shortCircuit: true };
    }
    if (specifier === "@fsd/entities/consultation") {
      return { url: `data:text/javascript,${encodeURIComponent(consultationExports)}`, shortCircuit: true };
    }
    if (specifier === "@fsd/shared/api") {
      return { url: new URL("shared/api/ApiError.ts", root).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
const { useConsultationForm } = await import("../../src/fsd/features/submit-consultation/model/useConsultationForm.ts");

const teacher = { id: 3, name: "임경원" };
const key = getConsultationDraftStorageKey("12");
const savedDraft = {
  title: "진로 상담", content: "포트폴리오 상담", category: "취업",
  teacherId: 3, date: "2026-11-02", period: "9교시",
};
let environment;
let calls;
let teachers;
let slots;
let submission;

beforeEach(() => {
  mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-30T00:00:00Z") });
  calls = [];
  teachers = deferred();
  slots = null;
  submission = null;
  environment = createConsultationEnvironment((path, init) => {
    calls.push({ path, init });
    if (init?.method === "POST") return submission?.promise ?? Promise.resolve("ok");
    if (path.endsWith("/teachers")) return teachers.promise;
    if (path.includes("/status?")) return slots?.promise ?? Promise.resolve([]);
    return Promise.resolve([]);
  });
});
afterEach(() => {
  environment.dispose();
  mock.timers.reset();
});

const mount = (type = "career") => environment.mount(() => useConsultationForm(type));
const seedDraft = (type = "career") =>
  writeConsultationDraft(environment.storage, key, type, savedDraft);
const advance = async (milliseconds) => {
  mock.timers.tick(milliseconds);
  await environment.runDueTimers();
};
const event = { preventDefault() {} };
const postCalls = () => calls.filter(({ init }) => init?.method === "POST");
const statusCalls = () => calls.filter(({ path }) => path.includes("/status?"));
const readyForm = async (type = "career") => {
  seedDraft(type);
  const form = mount(type);
  teachers.resolve([teacher]);
  await environment.settle();
  assert.equal(form.value.availabilityStatus, "success");
  if (form.value.selectedTime === null) {
    form.value.toggleTime("9교시");
    await environment.settle();
  }
  return form;
};

test("A1: clicking the current tab preserves loaded teachers, selection and category", async () => {
  seedDraft();
  const form = mount();
  teachers.resolve([teacher]);
  await environment.settle();
  form.value.handleTabChange("career");
  await environment.settle();
  assert.equal(form.value.teacherStatus, "ready");
  assert.deepEqual(form.value.teachers, [teacher]);
  assert.equal(form.value.selectedTeacher?.id, 3);
  assert.equal(form.value.category, "취업");
  assert.equal(calls.filter(({ path }) => path.endsWith("/teachers")).length, 1);
});

test("A2: slow teachers cannot erase the immutable draft or new text edits", async () => {
  seedDraft();
  const form = mount();
  await environment.settle();
  form.value.setTitle("수정한 상담 제목");
  await environment.settle();
  await advance(500);
  const pending = readConsultationDrafts(environment.storage, key).career;
  assert.equal(pending.teacherId, 3);
  assert.equal(pending.date, "2026-11-02");
  assert.equal(pending.period, "9교시");
  teachers.resolve([teacher]);
  await environment.settle();
  assert.equal(form.value.title, "수정한 상담 제목");
  assert.equal(form.value.selectedTeacher?.id, 3);
  assert.equal(form.value.selectedTime, "9교시");
  await advance(400);
  assert.deepEqual(readConsultationDrafts(environment.storage, key).career, {
    ...savedDraft, title: "수정한 상담 제목",
  });
});

test("A2: slow slot lookup does not autosave away the saved period", async () => {
  seedDraft();
  slots = deferred();
  const form = mount();
  teachers.resolve([teacher]);
  await environment.settle();
  await advance(500);
  assert.equal(readConsultationDrafts(environment.storage, key).career.period, "9교시");
  slots.resolve([]);
  await environment.settle();
  assert.equal(form.value.selectedTime, "9교시");
});

test("B2: first availability request uses the saved date without a default-date waterfall", async () => {
  seedDraft();
  slots = deferred();
  const form = mount();
  teachers.resolve([teacher]);
  await environment.settle();
  assert.equal(form.value.selectedDate, "2026-11-02");
  assert.deepEqual(statusCalls().map(({ path }) => path), [
    "/student/course/status?teacherId=3&date=2026-11-02",
  ]);
  slots.reject(new Error("offline"));
  await environment.settle();
  assert.equal(form.value.selectedDate, "2026-11-02");
  assert.equal(form.value.availabilityStatus, "error");
});

test("A4: synchronous duplicate submits send one POST before React renders", async () => {
  const form = await readyForm();
  submission = deferred();
  const submit = form.value.handleSubmit;
  const first = submit(event);
  const duplicate = submit(event);
  assert.equal(postCalls().length, 1, "guard must work before React renders submitting=true");
  submission.resolve("ok");
  await Promise.all([first, duplicate]);
});

test("A4: success stays locked until navigation and the cleared draft stays empty", async () => {
  const form = await readyForm();
  await form.value.handleSubmit(event);
  await environment.settle();
  assert.equal(form.value.submitting, true);
  await form.value.handleSubmit(event);
  assert.equal(postCalls().length, 1);
  await advance(699);
  assert.deepEqual(environment.navigations, []);
  await advance(1);
  assert.deepEqual(environment.navigations, ["/"]);
  assert.deepEqual(readConsultationDrafts(environment.storage, key).career, createEmptyConsultationDraft());
});

test("A4: failed submit unlocks and permits a deliberate retry", async () => {
  const form = await readyForm();
  submission = deferred();
  const first = form.value.handleSubmit(event);
  submission.reject(new Error("offline"));
  await first;
  await environment.settle();
  assert.equal(form.value.submitting, false);
  assert.equal(readConsultationDrafts(environment.storage, key).career.teacherId, 3);
  submission = null;
  await form.value.handleSubmit(event);
  assert.equal(postCalls().length, 2);
});

test("A4: unmount cancels the pending success navigation", async () => {
  const form = await readyForm();
  await form.value.handleSubmit(event);
  await environment.settle();
  assert.equal(postCalls().length, 1);
  form.unmount();
  await advance(1000);
  assert.deepEqual(environment.navigations, []);
});

test("A9: explicit availability retry bypasses cache and applies current locks", async () => {
  seedDraft();
  const form = mount();
  teachers.resolve([teacher]);
  await environment.settle();
  assert.equal(statusCalls()[0]?.init?.cache, undefined, "ordinary selection retains transport caching");
  slots = deferred();
  form.value.retryAvailability();
  await environment.settle();
  assert.equal(statusCalls().at(-1)?.init?.cache, "no-store");
  slots.resolve([{ teacherId: 3, date: "2026-11-02", period: "9교시", state: "LOCKED", available: false }]);
  await environment.settle();
  assert.equal(form.value.isTimeUnavailable("9교시"), true);
  assert.equal(form.value.selectedTime, null);
});

test("submit preserves the POST contract and invalidates only its consultation kind", async () => {
  const form = await readyForm("general");
  assert.equal(form.value.isTimeUnavailable("4교시"), true);
  assert.equal(form.value.isTimeUnavailable("9교시"), false);
  assert.equal(form.value.selectedTime, "9교시");
  await form.value.handleSubmit(event);
  const posted = postCalls()[0];
  assert.equal(posted?.path, "/student/common");
  assert.deepEqual(JSON.parse(String(posted?.init?.body)), {
    title: "진로 상담", content: "포트폴리오 상담", category: "취업",
    teacherId: 3, date: "2026-11-02", period: "9교시",
  });
  assert.deepEqual(posted?.init?.invalidateCache, ["/student/common", "/teacher/common"]);
});

test("missing saved teacher clears dependent selection and autosaves the valid draft", async () => {
  seedDraft();
  const form = mount();
  teachers.resolve([{ id: 99, name: "다른 교사" }]);
  await environment.settle();
  assert.equal(form.value.teacherStatus, "ready");
  assert.equal(form.value.selectedTeacher, null);
  assert.equal(form.value.selectedTime, null);
  assert.deepEqual(statusCalls(), []);
  await advance(400);
  const saved = readConsultationDrafts(environment.storage, key).career;
  assert.equal(saved.title, "진로 상담");
  assert.equal(saved.teacherId, null);
  assert.equal(saved.period, null);
});

test("invalid saved date cannot replay its period on a different date", async () => {
  writeConsultationDraft(environment.storage, key, "career", { ...savedDraft, date: "2026-10-29" });
  const form = mount();
  teachers.resolve([teacher]);
  await environment.settle();
  assert.equal(form.value.selectedTeacher?.id, 3);
  assert.equal(form.value.selectedDate, "2026-10-30");
  assert.equal(form.value.selectedTime, null);
  assert.deepEqual(statusCalls().map(({ path }) => path), [
    "/student/course/status?teacherId=3&date=2026-10-30",
  ]);
});

test("A2: manual date selection wins while the saved teacher finishes loading", async () => {
  seedDraft();
  const form = mount();
  await environment.settle();
  form.value.toggleDate("2026-11-03");
  await environment.settle();
  await advance(500);
  const pending = readConsultationDrafts(environment.storage, key).career;
  assert.equal(pending.teacherId, 3);
  assert.equal(pending.date, "2026-11-03");
  assert.equal(pending.period, null);
  teachers.resolve([teacher]);
  await environment.settle();
  assert.equal(form.value.selectedTeacher?.id, 3);
  assert.equal(form.value.selectedDate, "2026-11-03");
  assert.equal(form.value.selectedTime, null);
});

test("A2: switching tabs during hydration preserves text and rejects the old teacher response", async () => {
  seedDraft();
  writeConsultationDraft(environment.storage, key, "general", {
    ...savedDraft, title: "일반 상담", teacherId: 4, date: "2026-11-03", period: "8교시",
  });
  const oldTeachers = teachers;
  const form = mount();
  await environment.settle();
  form.value.setContent("교사 조회 중 수정한 내용");
  await environment.settle();
  teachers = deferred();
  form.value.handleTabChange("general");
  await environment.settle();
  const career = readConsultationDrafts(environment.storage, key).career;
  assert.equal(career.content, "교사 조회 중 수정한 내용");
  assert.equal(career.teacherId, 3);
  assert.equal(career.period, "9교시");
  teachers.resolve([{ id: 4, name: "일반 교사" }]);
  await environment.settle();
  oldTeachers.resolve([teacher]);
  await environment.settle();
  assert.equal(form.value.counselType, "general");
  assert.equal(form.value.title, "일반 상담");
  assert.equal(form.value.selectedTeacher?.id, 4);
  assert.equal(form.value.selectedDate, "2026-11-03");
  assert.equal(form.value.selectedTime, "8교시");
});

test("availability response for a superseded date cannot lock the new selection", async () => {
  seedDraft();
  const oldSlots = deferred();
  slots = oldSlots;
  const form = mount();
  teachers.resolve([teacher]);
  await environment.settle();
  slots = deferred();
  form.value.toggleDate("2026-11-03");
  await environment.settle();
  slots.resolve([]);
  await environment.settle();
  form.value.toggleTime("9교시");
  await environment.settle();
  oldSlots.resolve([{ teacherId: 3, date: "2026-11-02", period: "9교시", state: "LOCKED", available: false }]);
  await environment.settle();
  assert.equal(form.value.selectedDate, "2026-11-03");
  assert.equal(form.value.selectedTime, "9교시");
  assert.equal(form.value.isTimeUnavailable("9교시"), false);
});

test("failed saved-date lookup retains the period until a no-store retry succeeds", async () => {
  seedDraft();
  slots = deferred();
  const form = mount();
  teachers.resolve([teacher]);
  await environment.settle();
  slots.reject(new Error("offline"));
  await environment.settle();
  await advance(500);
  assert.equal(readConsultationDrafts(environment.storage, key).career.period, "9교시");
  slots = null;
  form.value.retryAvailability();
  await environment.settle();
  assert.equal(statusCalls().at(-1)?.init?.cache, "no-store");
  assert.equal(form.value.selectedDate, "2026-11-02");
  assert.equal(form.value.selectedTime, "9교시");
});

test("successful POST after unmount cannot schedule navigation or a success toast", async () => {
  const form = await readyForm();
  submission = deferred();
  const pending = form.value.handleSubmit(event);
  form.unmount();
  submission.resolve("ok");
  await pending;
  await advance(1000);
  assert.deepEqual(environment.navigations, []);
  assert.equal(environment.storage.getItem("jobdam:consultation-toast"), null);
});

test("cancellation clears the draft without autosave recreating it", async () => {
  const form = await readyForm();
  form.value.handleCancel();
  await environment.settle();
  await advance(1000);
  assert.deepEqual(readConsultationDrafts(environment.storage, key).career, createEmptyConsultationDraft());
  assert.deepEqual(environment.navigations, ["/"]);
});
