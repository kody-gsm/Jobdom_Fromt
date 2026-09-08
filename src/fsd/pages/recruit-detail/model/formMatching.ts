import type { FormSummary } from "@fsd/entities/form";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/주식회사|㈜|\(주\)/g, "")
    .replace(/[\s()[\]{}.,·ㆍ_-]/g, "");

export const findRecruitForm = (
  companyName: string | null,
  forms: Pick<FormSummary, "id" | "title">[],
) => {
  if (!companyName) return null;
  const company = normalize(companyName);
  return forms.find((form) => normalize(form.title).includes(company)) ?? null;
};
