import assert from "node:assert/strict";
import {
  buildFormAnswers,
  getMissingRequiredQuestion,
} from "../../src/fsd/entities/form/model/answers.ts";
import type { FormQuestion } from "../../src/fsd/entities/form/model/types.ts";
import { createFormApi } from "../../src/fsd/entities/form/api/createFormApi.ts";

const questions = [
  {
    id: 10,
    orderIndex: 0,
    title: "이름",
    description: null,
    required: true,
    type: "SHORT_TEXT",
    options: [],
  },
  {
    id: 11,
    orderIndex: 1,
    title: "지원 직무",
    description: null,
    required: true,
    type: "MULTIPLE_CHOICE",
    options: [],
  },
] satisfies FormQuestion[];
assert.equal(
  getMissingRequiredQuestion(questions, { 10: "김철수", 11: [] })?.id,
  11,
);
assert.deepEqual(
  buildFormAnswers(questions, { 10: " 김철수 ", 11: [100, 101] }),
  [
    { questionId: 10, textValue: "김철수" },
    { questionId: 11, optionIds: [100, 101] },
  ],
);

const calls: Array<{ path: string; init?: RequestInit }> = [];
const api = createFormApi(async <T>(path: string, init?: RequestInit) => {
  calls.push({ path, init });
  return undefined as T;
});
await api.getAll();
await api.getById(3);
await api.getMySubmission(3);
await api.submit(3, [{ questionId: 10, textValue: "김철수" }]);
assert.equal(calls[0]?.path, "/form");
assert.equal(calls[1]?.path, "/form/3");
assert.equal(calls[2]?.path, "/student/form/3/submission");
assert.equal(calls[3]?.path, "/student/form/3/submission");
assert.equal(calls[3]?.init?.method, "POST");
