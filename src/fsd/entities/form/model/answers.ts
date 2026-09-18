import type { FormAnswerInput, FormQuestion } from "./types.ts";

export type FormFileValue = { file?: File; fileId?: number; fileName: string };
export type FormValue = string | number[] | FormFileValue;

const hasValue = (value: FormValue | undefined) =>
  Array.isArray(value)
    ? value.length > 0
    : typeof value === "string"
      ? Boolean(value.trim())
      : Boolean(value?.file || value?.fileId);

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
    ...(Array.isArray(value)
      ? { optionIds: value }
      : typeof value === "string"
        ? { textValue: value.trim() }
        : { fileId: value.fileId }),
  }];
});
