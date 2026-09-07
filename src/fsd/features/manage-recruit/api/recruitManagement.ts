import { createFormApi } from "@fsd/entities/form";
import { createRecruitApi } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";
import { createRecruitDashboardLoader } from "../model/dashboard.ts";

const formApi = createFormApi(requestWithSession);
const recruitApi = createRecruitApi(requestWithSession);

export const analyzeRecruit = recruitApi.analyze;
export const updateRecruit = recruitApi.updateTeacher;
export const publishRecruit = recruitApi.publishTeacher;
export const getRecruitDashboard = createRecruitDashboardLoader({
  getTeacherRecruits: recruitApi.getTeacherAll,
  getTeacherForms: formApi.getTeacherAll,
  getFormSubmissions: formApi.getSubmissions,
});
