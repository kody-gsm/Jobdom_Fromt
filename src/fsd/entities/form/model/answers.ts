import type { FormAnswerInput, FormQuestion } from "./types.ts";

export type FormValue = string | number[];

const hasValue = (value: FormValue | undefined) =>
  Array.isArray(value) ? value.length > 0 : Boolean(value?.trim());

export const getMissingRequiredQuestion = (
  questions: FormQuestion[],
  values: Record<number, FormValue>,
) => questions.find((question) => question.required && !hasValue(values[question.id]));

export const buildFormAnswers = (
  questions: FormQuestion[],
  values: Record<number, FormValue>,
): FormAnswerInput[] => questions.flatMap((question) => {
  const value = values[question.id];
  if (!hasValue(value)) return [];
  return [{
    questionId: question.id,
    ...(Array.isArray(value) ? { optionIds: value } : { textValue: value.trim() }),
  }];
});
