import type { FormSummary } from "@fsd/entities/form";

export const findRecruitForm = (
  formId: number | null,
  forms: Pick<FormSummary, "id" | "title">[],
) => {
  if (formId === null) return null;
  return forms.find((form) => form.id === formId) ?? null;
};
