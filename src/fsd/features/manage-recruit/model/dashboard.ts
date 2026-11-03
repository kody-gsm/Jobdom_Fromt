import type { FormSubmissionSummary, FormSummary } from "@fsd/entities/form";
import type { Recruit } from "@fsd/entities/recruit";
import type { RecruitDashboardRow } from "./types.ts";

const normalizeName = (value: string) =>
  value
    .toLowerCase()
    .replace(/주식회사|㈜|\(주\)/g, "")
    .replace(/[\s()[\]{}.,·ㆍ_-]/g, "");

export const findRecruitForm = (recruit: Recruit, forms: FormSummary[]) => {
  if (recruit.formId) {
    return forms.find((form) => form.id === recruit.formId) || null;
  }
  const company = normalizeName(recruit.companyName || "");
  if (!company) return null;
  return forms.find((form) => normalizeName(form.title).includes(company)) || null;
};

type LoadInit = { cache?: RequestCache };

type RecruitDashboardDependencies = {
  getTeacherRecruits: (init?: LoadInit) => Promise<Recruit[]>;
  getTeacherForms: (init?: LoadInit) => Promise<FormSummary[]>;
  getFormSubmissions: (formId: number, init?: LoadInit) => Promise<FormSubmissionSummary[]>;
};

// fresh: '새로고침'처럼 사용자가 최신 내용을 원할 때는 30초 조회 캐시를 거치지 않는다.
export const createRecruitDashboardLoader = (
  dependencies: RecruitDashboardDependencies,
) => async ({ fresh = false }: { fresh?: boolean } = {}): Promise<RecruitDashboardRow[]> => {
  const init: LoadInit | undefined = fresh ? { cache: "no-store" } : undefined;
  const [recruits, forms] = await Promise.all([
    dependencies.getTeacherRecruits(init),
    dependencies.getTeacherForms(init),
  ]);
  const matches = recruits.map((recruit) => ({
    recruit,
    form: findRecruitForm(recruit, forms),
  }));
  const formIds = [...new Set(matches.flatMap(({ form }) => form ? [form.id] : []))];
  const submissions = new Map(await Promise.all(
    formIds.map(async (formId) => [
      formId,
      await dependencies.getFormSubmissions(formId, init),
    ] as const),
  ));
  return matches.map(({ recruit, form }) => ({
    recruit,
    form,
    applicants: form ? submissions.get(form.id) || [] : [],
  }));
};
