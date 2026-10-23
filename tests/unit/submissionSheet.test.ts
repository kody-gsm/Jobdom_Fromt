import assert from "node:assert/strict";
import type { DynamicForm, FormSubmissionSummary } from "../../src/fsd/entities/form/index.ts";
import { getFormSubmissionSheet } from "../../src/fsd/pages/teacher-form-submissions/api/submissions.ts";

const form: DynamicForm = {
  id: 1, title: "지원 폼", description: null, deadline: null, status: "PUBLISHED",
  createdAt: "2026-10-20T00:00:00Z", updatedAt: "2026-10-20T00:00:00Z", questions: [],
};
const summaries: FormSubmissionSummary[] = Array.from({ length: 13 }, (_, index) => ({
  id: 30 - index, userId: index + 1, userName: `학생${index + 1}`,
  studentNumber: `00${index + 1}`, submittedAt: "2026-10-20T00:00:00Z",
}));
const detailResponse = (id: number) => Response.json({
  ...summaries.find((summary) => summary.id === id), formId: form.id, formTitle: form.title, answers: [],
});
const nextTurn = () => new Promise<void>((resolve) => setImmediate(resolve));

const mockFetch = (
  loadedSummaries: FormSubmissionSummary[],
  getDetailResponse: (id: number) => Response | Promise<Response>,
) => {
  const requests: string[] = [];
  globalThis.fetch = async (input) => {
    const path = new URL(String(input), "https://test.local").pathname;
    requests.push(path);
    if (path.endsWith("/teacher/form/1")) return Response.json(form);
    if (path.endsWith("/teacher/form/1/submission")) return Response.json(loadedSummaries);
    const match = path.match(/\/teacher\/form\/1\/submission\/(\d+)$/);
    assert.ok(match, `Unexpected request: ${path}`);
    return getDetailResponse(Number(match[1]));
  };
  return requests;
};

const originalFetch = globalThis.fetch;
try {
  const pending = new Map<number, (response: Response) => void>();
  const startedIds: number[] = [];
  const completedIds: number[] = [];
  let active = 0;
  let maximumActive = 0;
  const requests = mockFetch(summaries, async (id) => {
    startedIds.push(id);
    active += 1;
    maximumActive = Math.max(maximumActive, active);
    const response = await new Promise<Response>((resolve) => pending.set(id, resolve));
    completedIds.push(id);
    active -= 1;
    return response;
  });
  const loading = getFormSubmissionSheet(1, new AbortController().signal);
  assert.equal(requests.length, 2, "폼과 제출 목록은 상세 조회 전에 함께 요청한다.");
  for (let offset = 0; offset < summaries.length; offset += 6) {
    await nextTurn();
    const batchIds = summaries.slice(offset, offset + 6).map(({ id }) => id);
    assert.deepEqual([...pending.keys()], batchIds);
    for (const id of [...batchIds].reverse()) pending.get(id)?.(detailResponse(id));
    pending.clear();
  }
  const result = await loading;
  assert.deepEqual(result.form, form);
  assert.deepEqual(result.submissions.map(({ id }) => id), summaries.map(({ id }) => id));
  assert.deepEqual(startedIds, summaries.map(({ id }) => id));
  assert.notDeepEqual(completedIds, startedIds, "응답 완료 순서와 무관하게 목록 순서를 유지한다.");
  assert.equal(maximumActive, 6);
  assert.equal(active, 0);

  let emptyDetailRequests = 0;
  mockFetch([], () => {
    emptyDetailRequests += 1;
    return Response.json({});
  });
  assert.deepEqual(await getFormSubmissionSheet(1, new AbortController().signal), { form, submissions: [] });
  assert.equal(emptyDetailRequests, 0);

  const failedBatchIds: number[] = [];
  mockFetch(summaries, (id) => {
    failedBatchIds.push(id);
    return id === summaries[1].id
      ? Response.json({ message: "응답 상세 조회 실패" }, { status: 500 })
      : detailResponse(id);
  });
  await assert.rejects(getFormSubmissionSheet(1, new AbortController().signal), /응답 상세 조회 실패/);
  await nextTurn();
  assert.deepEqual(failedBatchIds, summaries.slice(0, 6).map(({ id }) => id));

  const controller = new AbortController();
  const abortPending = new Map<number, (response: Response) => void>();
  const abortedIds: number[] = [];
  mockFetch(summaries, (id) => {
    abortedIds.push(id);
    return new Promise<Response>((resolve) => abortPending.set(id, resolve));
  });
  const abortedLoading = getFormSubmissionSheet(1, controller.signal);
  const rejection = assert.rejects(abortedLoading, { name: "AbortError" });
  await nextTurn();
  assert.equal(abortPending.size, 6);
  controller.abort();
  for (const [id, resolve] of abortPending) resolve(detailResponse(id));
  await rejection;
  await nextTurn();
  assert.deepEqual(abortedIds, summaries.slice(0, 6).map(({ id }) => id));
} finally {
  globalThis.fetch = originalFetch;
}

console.log("submission sheet loader tests passed");
