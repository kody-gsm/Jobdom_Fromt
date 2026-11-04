import { createFormApi } from "@fsd/entities/form";
import { createRecruitApi } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";
import { createRecruitDashboardLoader, findRecruitForm } from "../model/dashboard.ts";
import type { Recruit, RecruitDashboardRow } from "../model/types.ts";

const formApi = createFormApi(requestWithSession);
const recruitApi = createRecruitApi(requestWithSession);

export const analyzeRecruit = recruitApi.analyze;
export const createRecruit = recruitApi.createTeacher;
export const getTeacherRecruits = recruitApi.getTeacherAll;
export const updateRecruit = recruitApi.updateTeacher;
export const deleteRecruit = recruitApi.deleteTeacher;
export const getRecruitDashboard = createRecruitDashboardLoader({
  getTeacherRecruits: recruitApi.getTeacherAll,
  getTeacherForms: formApi.getTeacherAll,
  getFormSubmissions: formApi.getSubmissions,
});

// 새로 만든 공고 한 건의 행만 만든다. 대시보드 전체(폼마다 지원자 목록)를 다시 받지 않는다.
export const getRecruitDashboardRow = async (recruit: Recruit): Promise<RecruitDashboardRow> => {
  const form = findRecruitForm(recruit, await formApi.getTeacherAll());
  return { recruit, form, applicants: form ? await formApi.getSubmissions(form.id) : [] };
};
