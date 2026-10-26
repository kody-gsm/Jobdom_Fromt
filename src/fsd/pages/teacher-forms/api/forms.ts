import { createFormApi } from "@fsd/entities/form";
import { createRecruitApi } from "@fsd/entities/recruit";
import type { RecruitNoticeChannelId } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";

const formApi = createFormApi(requestWithSession);
const recruitApi = createRecruitApi(requestWithSession);

export const getTeacherForms = formApi.getTeacherAll;
export const getTeacherRecruits = recruitApi.getTeacherAll;
export const getTeacherForm = formApi.getTeacherById;
export const getFormSubmissions = formApi.getSubmissions;
export const createForm = formApi.createTeacher;
export const updateForm = formApi.updateTeacher;
// 초안 공고에 딸린 폼은 공고 공개로 함께 게시하며, 공고 알림을 보낼 디스코드 채널이 필요하다.
export const publishForm = async (formId: number, channelId: RecruitNoticeChannelId | null) => {
  const recruit = (await recruitApi.getTeacherAll()).find((candidate) => candidate.formId === formId);
  if (recruit?.status === "DRAFT") {
    if (!channelId) throw new Error("공고와 함께 공개하려면 디스코드 알림 채널을 선택해주세요.");
    await recruitApi.publishTeacher(recruit.id, channelId);
    return formApi.getTeacherById(formId);
  }
  return formApi.publishTeacher(formId);
};
export const closeForm = formApi.closeTeacher;
