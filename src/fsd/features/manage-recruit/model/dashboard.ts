import type { FormSubmissionSummary, FormSummary } from "@fsd/entities/form";
import type { Recruit } from "@fsd/entities/recruit";
import type { RecruitDashboardRow } from "./types.ts";

const normalizeName = (value: string) =>
  value
    .toLowerCase()
    .replace(/주식회사|㈜|\(주\)/g, "")
    .replace(/[\s()[\]{}.,·ㆍ_-]/g, "");

export const findRecruitForm = (recruit: Recruit, forms: FormSummary[]) => {
  const company = normalizeName(recruit.companyName || "");
  if (!company) return null;
  return forms.find((form) => normalizeName(form.title).includes(company)) || null;
};

type RecruitDashboardDependencies = {
  getTeacherRecruits: () => Promise<Recruit[]>;
  getTeacherForms: () => Promise<FormSummary[]>;
  getFormSubmissions: (formId: number) => Promise<FormSubmissionSummary[]>;
};

export const createRecruitDashboardLoader = (
  dependencies: RecruitDashboardDependencies,
) => async (): Promise<RecruitDashboardRow[]> => {
  const [recruits, forms] = await Promise.all([
    dependencies.getTeacherRecruits(),
    dependencies.getTeacherForms(),
  ]);
  const matches = recruits.map((recruit) => ({
    recruit,
    form: findRecruitForm(recruit, forms),
  }));
  const formIds = [...new Set(matches.flatMap(({ form }) => form ? [form.id] : []))];
  const submissions = new Map(await Promise.all(
    formIds.map(async (formId) => [
      formId,
      await dependencies.getFormSubmissions(formId),
    ] as const),
  ));
  return matches.map(({ recruit, form }) => ({
    recruit,
    form,
    applicants: form ? submissions.get(form.id) || [] : [],
  }));
};
