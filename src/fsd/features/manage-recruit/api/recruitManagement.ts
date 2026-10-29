import { createFormApi } from "@fsd/entities/form";
import { createRecruitApi } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";
import { createRecruitDashboardLoader } from "../model/dashboard.ts";
import { createPublishRecruitWithNotice } from "./publishRecruitWithNotice.ts";

const formApi = createFormApi(requestWithSession);
const recruitApi = createRecruitApi(requestWithSession);

export const analyzeRecruit = recruitApi.analyze;
export const createRecruit = recruitApi.createTeacher;
export const getTeacherRecruits = recruitApi.getTeacherAll;
export const updateRecruit = recruitApi.updateTeacher;
export const deleteRecruit = recruitApi.deleteTeacher;
export const addRecruitImages = recruitApi.addImages;
export const deleteRecruitImage = recruitApi.deleteImage;
export const getNoticeChannels = recruitApi.getNoticeChannels;
export const publishRecruitWithNotice = createPublishRecruitWithNotice(recruitApi);
export const getRecruitDashboard = createRecruitDashboardLoader({
  getTeacherRecruits: recruitApi.getTeacherAll,
  getTeacherForms: formApi.getTeacherAll,
  getFormSubmissions: formApi.getSubmissions,
});
