import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const deferred = () => {
  let resolvePromise;
  let reject;
  const promise = new Promise((resolve, rejectPromise) => {
    resolvePromise = resolve;
    reject = rejectPromise;
  });
  return { promise, resolve: resolvePromise, reject };
};

// Execute the real TS/TSX with a deterministic hook host. Only React's host,
// browser time/events and external API calls are replaced; domain logic is real.
const createHost = (overrides = {}) => {
  let now = new Date("2026-10-30T12:00:00+09:00").getTime();
  let cursor = 0;
  let dirty = true;
  let render;
  let value;
  let renders = 0;
  let timerId = 0;
  const slots = [];
  const effects = [];
  const timers = new Map();
  const events = new Map();
  const modules = new Map();
  const browser = {
    visibilityState: "visible",
    title: "",
    getElementById: () => null,
    addEventListener: (name, callback) => {
      if (!events.has(name)) events.set(name, new Set());
      events.get(name).add(callback);
    },
    removeEventListener: (name, callback) => events.get(name)?.delete(callback),
    setTimeout: (callback, delay) => {
      const id = ++timerId;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
  };
  class ClockDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const changed = (a, b) => !a || !b || a.length !== b.length || a.some((item, i) => !Object.is(item, b[i]));
  const react = {
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === "function" ? initial() : initial;
      return [slots[i], (next) => {
        const updated = typeof next === "function" ? next(slots[i]) : next;
        if (!Object.is(updated, slots[i])) { slots[i] = updated; dirty = true; }
      }];
    },
    useRef(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: initial };
      return slots[i];
    },
    useMemo(callback, deps) {
      const i = cursor++;
      if (!slots[i] || changed(slots[i].deps, deps)) slots[i] = { deps, value: callback() };
      return slots[i].value;
    },
    useCallback(callback, deps) { return react.useMemo(() => callback, deps); },
    useEffect(callback, deps) {
      const i = cursor++;
      if (!slots[i] || changed(slots[i].deps, deps)) {
        effects.push(() => {
          slots[i]?.cleanup?.();
          slots[i] = { deps, cleanup: callback() };
        });
      }
    },
  };
  const context = vm.createContext({
    console, queueMicrotask, Date: ClockDate, document: browser, window: browser,
    setTimeout: browser.setTimeout, clearTimeout: browser.clearTimeout,
    File, Blob, FormData, AbortSignal, URL, process,
  });
  const load = (path) => {
    const fullPath = resolve(root, path);
    if (modules.has(fullPath)) return modules.get(fullPath).exports;
    const loadedModule = { exports: {} };
    modules.set(fullPath, loadedModule);
    const imports = (specifier) => {
      if (specifier in overrides) return overrides[specifier];
      if (specifier === "react") return react;
      if (specifier === "@fsd/entities/user") return { requestWithSession: async () => [] };
      if (specifier === "@fsd/shared/ui") return { ContentCard() {}, ActionButton() {}, FileDownload() {} };
      if (specifier === "next/link") return { default() {} };
      if (specifier.startsWith(".") || specifier.startsWith("@fsd/")) {
        const target = specifier.startsWith("@fsd/")
          ? resolve(root, "src/fsd", specifier.slice(5))
          : resolve(dirname(fullPath), specifier);
        const file = [target, `${target}.ts`, `${target}.tsx`, `${target}/index.ts`]
          .find((candidate) => existsSync(candidate) && /\.[cm]?[jt]sx?$/.test(candidate));
        return load(file);
      }
      return require(specifier);
    };
    const source = ts.transpileModule(readFileSync(fullPath, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      fileName: fullPath,
    }).outputText;
    vm.runInContext(`(function(require,module,exports){${source}\n})`, context, { filename: fullPath })(imports, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  };
  const flush = async () => {
    for (let round = 0; round < 24; round += 1) {
      await Promise.resolve();
      if (dirty && render) {
        dirty = false;
        cursor = 0;
        value = render();
        renders += 1;
        effects.splice(0).forEach((effect) => effect());
      }
    }
    return value;
  };
  return {
    load, flush, browser, timers,
    get value() { return value; },
    get renders() { return renders; },
    mount(callback) { render = callback; dirty = true; return flush(); },
    rerender() { dirty = true; return flush(); },
    async advance(ms, fire = true) {
      now += ms;
      if (fire) {
        for (const [id, timer] of [...timers]) {
          if (timer.at <= now) { timers.delete(id); timer.callback(); }
        }
      }
      return flush();
    },
    async emit(name) { events.get(name)?.forEach((callback) => callback()); return flush(); },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); render = null; },
    get listenerCount() { return [...events.values()].reduce((sum, listeners) => sum + listeners.size, 0); },
  };
};

const nodes = (tree) => {
  if (!tree || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
};
const question = (tree, id = 1) => nodes(tree).find((node) => node.props?.question?.id === id);
const makeForm = (id = 1, extra = {}) => ({
  id, title: `Form ${id}`, description: null, deadline: null, status: "PUBLISHED",
  questionCount: 1, createdAt: "", updatedAt: "",
  questions: [{ id: 1, orderIndex: 1, type: "SHORT_TEXT", title: "내용", description: null, required: true, options: [] }],
  ...extra,
});
const makeRecruit = (id = 1, extra = {}) => ({
  id, companyName: "Company", interviewDate: null, deadline: null, summary: null,
  formId: null, status: "PUBLISHED", createdAt: "", updatedAt: "", ...extra,
});
const submission = (formId = 1, text = "Saved") => ({
  id: 10, formId, formTitle: "Form", userId: 20, userName: "Student", studentNumber: "1101", submittedAt: "",
  answers: [{ questionId: 1, questionTitle: "내용", type: "SHORT_TEXT", textValue: text,
    selectedOptionIds: [], selectedOptionLabels: [], fileId: null, fileName: null, fileSize: null, fileDownloadUrl: null }],
});
const submitHost = (api) => {
  const host = createHost({ "../api/form": { formApi: api } });
  const { SubmitForm } = host.load("src/fsd/features/submit-form/ui/SubmitForm.tsx");
  return { host, SubmitForm };
};

test("questions stay locked until a late no-submission response, then accept edits", async () => {
  const lookup = deferred();
  const { host, SubmitForm } = submitHost({ getById: async () => makeForm(), getMySubmission: () => lookup.promise });
  await host.mount(() => SubmitForm({ formId: 1 }));
  assert.equal(question(host.value).props.disabled, true, "pending lookup must lock questions");
  const { ApiError } = host.load("src/fsd/shared/api/ApiError.ts");
  lookup.reject(new ApiError("Not submitted", 404));
  await host.flush();
  assert.equal(question(host.value).props.disabled, false);
  question(host.value).props.onChange("Keep this answer");
  await host.flush();
  assert.equal(question(host.value).props.value, "Keep this answer");
  host.unmount();
});

test("failed submission lookup keeps questions locked through retry and blocks direct submission", async () => {
  let writes = 0;
  const retry = deferred();
  let reads = 0;
  const { host, SubmitForm } = submitHost({
    getById: async () => makeForm(),
    getMySubmission: () => ++reads === 1 ? Promise.reject(new Error("Offline")) : retry.promise,
    submit: async () => { writes += 1; return submission(); },
  });
  await host.mount(() => SubmitForm({ formId: 1 }));
  assert.equal(question(host.value).props.disabled, true);
  question(host.value).props.onChange("Blocked edit");
  await host.flush();
  await host.value.props.onSubmit({ preventDefault() {} });
  assert.equal(writes, 0);
  const button = nodes(host.value).find((node) => node.props?.children === "제출 내역 다시 시도");
  button.props.onClick();
  await host.flush();
  assert.equal(question(host.value).props.disabled, true);
  const { ApiError } = host.load("src/fsd/shared/api/ApiError.ts");
  retry.reject(new ApiError("Not submitted", 404));
  await host.flush();
  assert.equal(question(host.value).props.value, undefined);
  assert.equal(question(host.value).props.disabled, false);
  host.unmount();
});

test("upload successes survive a later upload failure and are reused on retry in serial order", async () => {
  const uploads = [];
  const answers = [];
  let secondAttempts = 0;
  const { host, SubmitForm } = submitHost({
    getById: async () => makeForm(1, { questions: [1, 2].map((id) => ({ id, orderIndex: id, type: "FILE", title: `File ${id}`, description: null, required: true, options: [] })) }),
    getMySubmission: async () => { const { ApiError } = host.load("src/fsd/shared/api/ApiError.ts"); throw new ApiError("Not submitted", 404); },
    uploadFile: async (id, file) => {
      uploads.push(file.name);
      if (file.name === "second.txt" && secondAttempts++ === 0) throw new Error("Upload failed");
      return { id: file.name === "first.txt" ? 101 : 102, originalName: file.name };
    },
    submit: async (id, data) => { answers.push(data); return { ...submission(id), answers: [] }; },
  });
  await host.mount(() => SubmitForm({ formId: 1 }));
  for (const [id, name] of [[1, "first.txt"], [2, "second.txt"]]) {
    question(host.value, id).props.onChange({ file: new File(["content"], name), fileName: name });
  }
  await host.flush();
  await host.value.props.onSubmit({ preventDefault() {} });
  await host.flush();
  assert.equal(question(host.value, 1).props.value.fileId, 101);
  await host.value.props.onSubmit({ preventDefault() {} });
  await host.flush();
  assert.deepEqual(uploads, ["first.txt", "second.txt", "second.txt"]);
  assert.equal(JSON.stringify(answers), '[[{"questionId":1,"fileId":101},{"questionId":2,"fileId":102}]]');
  host.unmount();
});

test("form list renders before deferred legacy checks finish", async () => {
  const lookup = deferred();
  const host = createHost({ "../api/forms.ts": { formsApi: { getAll: async () => [makeForm()], getMySubmission: () => lookup.promise } } });
  const { useFormsPage } = host.load("src/fsd/pages/forms/model/useFormsPage.ts");
  await host.mount(useFormsPage);
  assert.equal(host.value.forms.length, 1);
  assert.equal(host.value.loading, false, "first render must not wait for status checks");
  host.unmount();
});

test("boolean submitted metadata including false and CLOSED skips item lookups", async () => {
  const lookedUp = [];
  const host = createHost({ "../api/forms.ts": { formsApi: {
    getAll: async () => [makeForm(1, { submitted: true, status: "CLOSED" }), makeForm(2, { submitted: false })],
    getMySubmission: async (id) => { lookedUp.push(id); return submission(id); },
  } } });
  const { useFormsPage } = host.load("src/fsd/pages/forms/model/useFormsPage.ts");
  await host.mount(useFormsPage);
  assert.deepEqual(lookedUp, []);
  assert.equal(host.value.forms[1].submitted, false);
  host.value.setFilter("SUBMITTED");
  await host.flush();
  assert.equal(JSON.stringify(host.value.visibleForms.map((form) => form.id)), "[1]");
  host.unmount();
});

test("legacy checks are bounded, update progressively, and stop scheduling after unmount", async () => {
  const lookups = [];
  const host = createHost({ "../api/forms.ts": { formsApi: {
    getAll: async () => Array.from({ length: 12 }, (_, i) => makeForm(i + 1)),
    getMySubmission: (id) => { const request = deferred(); lookups.push({ id, ...request }); return request.promise; },
  } } });
  const { useFormsPage } = host.load("src/fsd/pages/forms/model/useFormsPage.ts");
  await host.mount(useFormsPage);
  assert.ok(lookups.length > 0 && lookups.length <= 4, `expected at most four active checks, got ${lookups.length}`);
  lookups[0].resolve(submission(lookups[0].id));
  await host.flush();
  assert.equal(host.value.forms[0].submitted, true, "completed metadata should appear without waiting for all checks");
  const started = lookups.length;
  host.unmount();
  lookups.slice(1).forEach((request) => request.resolve(submission(request.id)));
  await host.flush();
  assert.equal(lookups.length, started);
});

test("superseded legacy checks cannot overwrite a newer list", async () => {
  const pending = deferred();
  let reads = 0;
  const host = createHost({ "../api/forms.ts": { formsApi: {
    getAll: async () => ++reads === 1 ? [makeForm()] : [makeForm(2, { submitted: false })],
    getMySubmission: () => pending.promise,
  } } });
  const { useFormsPage } = host.load("src/fsd/pages/forms/model/useFormsPage.ts");
  await host.mount(useFormsPage);
  void host.value.retry();
  await host.flush();
  pending.resolve(submission());
  await host.flush();
  assert.equal(host.value.forms[0].id, 2);
  assert.equal(host.value.forms[0].submitted, false);
  host.unmount();
});

test("mixed legacy metadata checks only missing booleans and keeps failures unknown", async () => {
  const lookedUp = [];
  const host = createHost({ "../api/forms.ts": { formsApi: {
    getAll: async () => [makeForm(1, { submitted: true }), makeForm(2, { submitted: false }), makeForm(3), makeForm(4)],
    getMySubmission: async (id) => {
      lookedUp.push(id);
      const { ApiError } = host.load("src/fsd/shared/api/ApiError.ts");
      throw new ApiError(id === 3 ? "Missing" : "Unavailable", id === 3 ? 404 : 500);
    },
  } } });
  const { useFormsPage } = host.load("src/fsd/pages/forms/model/useFormsPage.ts");
  await host.mount(useFormsPage);
  assert.deepEqual(lookedUp, [3, 4]);
  assert.equal(host.value.forms[2].submitted, false);
  assert.equal(host.value.forms[3].submitted, undefined, "server failure must not mean unsubmitted");
  assert.equal(host.value.error, "", "status failure must not hide the list");
  host.unmount();
});

test("form change ignores old submission hydration and preserves the new form's saved answers", async () => {
  const oldLookup = deferred();
  let id = 1;
  const { host, SubmitForm } = submitHost({
    getById: async (formId) => makeForm(formId),
    getMySubmission: (formId) => formId === 1 ? oldLookup.promise : Promise.resolve(submission(2, "Second form answer")),
  });
  await host.mount(() => SubmitForm({ formId: id }));
  id = 2;
  await host.rerender();
  const edit = nodes(host.value).find((node) => node.props?.children === "재응답");
  edit.props.onClick({ preventDefault() {} });
  await host.flush();
  assert.equal(question(host.value).props.value, "Second form answer");
  question(host.value).props.onChange("New edit");
  await host.flush();
  oldLookup.resolve(submission(1, "Obsolete answer"));
  await host.flush();
  assert.equal(question(host.value).props.value, "New edit");
  host.unmount();
});

for (const kind of ["forms", "recruit"]) {
  test(`${kind} OPEN filter expires at the deadline without recurring page ticks`, async () => {
    const deadline = "2026-10-30T03:00:10.000000000Z";
    const overrides = kind === "forms"
      ? { "../api/forms.ts": { formsApi: { getAll: async () => [makeForm(1, { deadline, submitted: false })] } } }
      : { "../api/recruit.ts": { getRecruits: async () => [makeRecruit(1, { deadline })] } };
    const host = createHost(overrides);
    const hook = kind === "forms"
      ? host.load("src/fsd/pages/forms/model/useFormsPage.ts").useFormsPage
      : host.load("src/fsd/pages/recruit/model/useRecruitList.ts").useRecruitList;
    await host.mount(hook);
    host.value.setFilter("OPEN");
    await host.flush();
    const renderCount = host.renders;
    await host.advance(1000);
    assert.equal(host.renders, renderCount, "no page tick before a relevant deadline");
    await host.advance(9000);
    assert.equal((host.value.visibleForms ?? host.value.visibleItems).length, 1, "equality is still open");
    await host.advance(1);
    assert.equal((host.value.visibleForms ?? host.value.visibleItems).length, 0, "deadline must invalidate memoized filters");
    host.unmount();
    assert.equal(host.timers.size, 0);
    assert.equal(host.listenerCount, 0);
  });
}

test("date-only deadlines refresh on visible resume after suspended timers", async () => {
  const host = createHost({ "../api/forms.ts": { formsApi: { getAll: async () => [makeForm(1, { deadline: "2026-10-30", submitted: false })] } } });
  const { useFormsPage } = host.load("src/fsd/pages/forms/model/useFormsPage.ts");
  await host.mount(useFormsPage);
  host.value.setFilter("OPEN");
  await host.flush();
  host.browser.visibilityState = "hidden";
  await host.advance(24 * 60 * 60 * 1000, false);
  host.browser.visibilityState = "visible";
  await host.emit("visibilitychange");
  assert.equal(host.value.visibleForms.length, 0);
  host.unmount();
});

test("deadline clock schedules successive boundaries and caps distant timers without page ticks", async () => {
  const host = createHost();
  const { useDeadlineClock } = host.load("src/fsd/shared/lib/useDeadlineClock.ts");
  let deadlines = ["invalid", null, "2026-10-30T03:00:01Z", "2026-10-30T03:00:02Z"];
  await host.mount(() => useDeadlineClock(deadlines));
  await host.advance(1001);
  assert.equal(host.value.getTime(), new Date("2026-10-30T03:00:01.001Z").getTime());
  assert.equal(host.timers.size, 1);
  await host.advance(1000);
  assert.equal(host.value.getTime(), new Date("2026-10-30T03:00:02.001Z").getTime());
  assert.equal(host.timers.size, 0);
  deadlines = ["2027-10-30T03:00:00Z"];
  await host.rerender();
  const renderCount = host.renders;
  await host.advance(2_147_483_647);
  assert.equal(host.renders, renderCount, "timer cap must not cause intermediate page rerenders");
  assert.equal(host.timers.size, 1);
  deadlines = ["invalid", null];
  await host.rerender();
  assert.equal(host.timers.size, 0);
  host.unmount();
  assert.equal(host.listenerCount, 0);
});

test("submit form questions and button close at deadline and reject late submission", async () => {
  let writes = 0;
  const { host, SubmitForm } = submitHost({
    getById: async () => makeForm(1, { deadline: "2026-10-30T03:00:01Z" }),
    getMySubmission: async () => { const { ApiError } = host.load("src/fsd/shared/api/ApiError.ts"); throw new ApiError("Missing", 404); },
    submit: async () => { writes += 1; return submission(); },
  });
  await host.mount(() => SubmitForm({ formId: 1 }));
  question(host.value).props.onChange("Answer");
  await host.flush();
  await host.advance(1001);
  assert.equal(question(host.value).props.disabled, true);
  await host.value.props.onSubmit({ preventDefault() {} });
  assert.equal(writes, 0);
  host.unmount();
});

test("unlinked recruit waits for detail then skips form list and retry", async () => {
  const detail = deferred();
  let listReads = 0;
  const host = createHost({
    "../api/recruit.ts": { getRecruit: () => detail.promise },
    "@fsd/entities/user": { requestWithSession: async () => { listReads += 1; return []; } },
  });
  const { useRecruitDetail } = host.load("src/fsd/pages/recruit-detail/model/useRecruitDetail.ts");
  await host.mount(() => useRecruitDetail(1));
  assert.equal(listReads, 0, "form list depends on linked ID");
  detail.resolve(makeRecruit());
  await host.flush();
  assert.equal(listReads, 0);
  assert.equal(host.value.formLoading, false);
  host.value.retryForm();
  await host.flush();
  assert.equal(listReads, 0);
  host.unmount();
});

test("linked recruit still matches exact formId, supports retry, and ignores obsolete lookup", async () => {
  const oldForms = deferred();
  let id = 1;
  let listReads = 0;
  const host = createHost({
    "../api/recruit.ts": { getRecruit: async (recruitId) => makeRecruit(recruitId, { formId: recruitId === 1 ? 7 : 8 }) },
    "@fsd/entities/user": { requestWithSession: async () => {
      listReads += 1;
      if (listReads === 1) return oldForms.promise;
      if (listReads === 2) throw new Error("Offline");
      return [makeForm(99, { title: "Company 지원서" }), makeForm(8, { title: "Exact link", status: "CLOSED" })];
    } },
  });
  const { useRecruitDetail } = host.load("src/fsd/pages/recruit-detail/model/useRecruitDetail.ts");
  await host.mount(() => useRecruitDetail(id));
  id = 2;
  await host.rerender();
  assert.ok(host.value.formError);
  host.value.retryForm();
  await host.flush();
  assert.equal(host.value.form.id, 8);
  oldForms.resolve([makeForm(7)]);
  await host.flush();
  assert.equal(host.value.form.id, 8);
  host.unmount();
});

test("linked recruit with missing exact ID does not match company title", async () => {
  const host = createHost({
    "../api/recruit.ts": { getRecruit: async () => makeRecruit(1, { formId: 7 }) },
    "@fsd/entities/user": { requestWithSession: async () => [makeForm(99, { title: "Company 지원서" })] },
  });
  const { useRecruitDetail } = host.load("src/fsd/pages/recruit-detail/model/useRecruitDetail.ts");
  await host.mount(() => useRecruitDetail(1));
  assert.equal(host.value.form, null);
  assert.equal(host.value.formLoading, false);
  host.unmount();
});

test("recruit detail application link closes when its deadline passes", async () => {
  const host = createHost({
    "../api/recruit.ts": { getRecruit: async () => makeRecruit(1, { formId: 7, deadline: "2026-10-30T03:00:01Z" }) },
    "@fsd/entities/user": { requestWithSession: async () => [makeForm(7)] },
    "@fsd/widgets/student-header": { StudentHeader() {} },
    "@fsd/features/copy-recruit-link": { CopyRecruitLinkButton() {} },
  });
  const { RecruitDetailPage } = host.load("src/fsd/pages/recruit-detail/ui/RecruitDetailPage.tsx");
  await host.mount(() => RecruitDetailPage({ recruitId: 1 }));
  assert.ok(nodes(host.value).some((node) => node.props?.href === "/forms/7"));
  await host.advance(1001);
  assert.equal(nodes(host.value).some((node) => node.props?.href === "/forms/7"), false);
  host.unmount();
});

test("form writes carry domain invalidation without changing endpoint, verb, or payload", async () => {
  const host = createHost();
  const { createFormApi } = host.load("src/fsd/entities/form/api/createFormApi.ts");
  const calls = [];
  const api = createFormApi(async (path, init) => { calls.push({ path, init }); return {}; });
  const answers = [{ questionId: 1, textValue: "Answer" }];
  const input = { title: "Form", description: "", questions: [{ type: "SHORT_TEXT", title: "내용", description: "", required: true, options: [] }] };
  await api.submit(1, answers);
  await api.updateSubmission(1, answers);
  await api.uploadFile(1, new File(["content"], "file.txt"));
  await api.createTeacher(input);
  await api.updateTeacher(1, input);
  await api.publishTeacher(1);
  await api.closeTeacher(1);
  assert.deepEqual(calls.map(({ path, init }) => [path, init.method]), [
    ["/student/form/1/submission", "POST"], ["/student/form/1/submission", "PATCH"],
    ["/student/form/1/file", "POST"], ["/teacher/form", "POST"],
    ["/teacher/form/1", "PATCH"], ["/teacher/form/1/publish", "POST"], ["/teacher/form/1/close", "POST"],
  ]);
  assert.equal(calls[0].init.body, '{"answers":[{"questionId":1,"textValue":"Answer"}]}');
  assert.equal(calls[2].init.body.get("file").name, "file.txt");
  for (const { path, init } of calls) {
    assert.equal(JSON.stringify(init.invalidateCache), '["/form","/student/form","/teacher/form","/recruit","/teacher/recruit"]', path);
  }
});
