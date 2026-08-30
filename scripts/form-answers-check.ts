import assert from "node:assert/strict";
import { buildFormAnswers, getMissingRequiredQuestion } from "../app/utils/formAnswers.ts";
import type { FormQuestion } from "../app/utils/api.ts";

const questions = [
  { id: 10, orderIndex: 0, title: "이름", description: null, required: true, type: "SHORT_TEXT", options: [] },
  { id: 11, orderIndex: 1, title: "지원 직무", description: null, required: true, type: "MULTIPLE_CHOICE", options: [] },
] satisfies FormQuestion[];

assert.equal(getMissingRequiredQuestion(questions, { 10: "김철수", 11: [] })?.id, 11);
assert.deepEqual(buildFormAnswers(questions, { 10: " 김철수 ", 11: [100, 101] }), [
  { questionId: 10, textValue: "김철수" },
  { questionId: 11, optionIds: [100, 101] },
]);
