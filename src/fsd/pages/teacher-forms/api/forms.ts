import { createFormApi } from "@fsd/entities/form";
import type { DynamicForm } from "@fsd/entities/form";
import { createRecruitApi } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";
import { publishRecruitWithNotice } from "@fsd/features/manage-recruit";
import type { RecruitChannelNotice } from "@fsd/features/manage-recruit";

const formApi = createFormApi(requestWithSession);
const recruitApi = createRecruitApi(requestWithSession);

export const getTeacherForms = formApi.getTeacherAll;
export const getTeacherRecruits = recruitApi.getTeacherAll;

export type PublishFormResult = { form: DynamicForm; channelNotice: RecruitChannelNotice };
export const getTeacherForm = formApi.getTeacherById;
export const getFormSubmissions = formApi.getSubmissions;
export const createForm = formApi.createTeacher;
export const updateForm = formApi.updateTeacher;
// 초안 공고에 딸린 폼은 공고 공개로 함께 게시하고, 채널을 고르면 그 채널에도 공고 알림을 보낸다.
export const publishForm = async (formId: number, channelId: string | null): Promise<PublishFormResult> => {
  const recruit = (await recruitApi.getTeacherAll()).find((candidate) => candidate.formId === formId);
  if (recruit?.status !== "DRAFT") return { form: await formApi.publishTeacher(formId), channelNotice: "none" };

  const { channelNotice } = await publishRecruitWithNotice(recruit.id, channelId);
  return { form: await formApi.getTeacherById(formId), channelNotice };
};
export const closeForm = formApi.closeTeacher;
