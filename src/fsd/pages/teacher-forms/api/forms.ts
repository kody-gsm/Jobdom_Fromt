import { createFormApi } from "@fsd/entities/form";
import type { DynamicForm } from "@fsd/entities/form";
import { createRecruitApi } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";

const formApi = createFormApi(requestWithSession);
const recruitApi = createRecruitApi(requestWithSession);

export const getTeacherForms = formApi.getTeacherAll;
export const getTeacherRecruits = recruitApi.getTeacherAll;
export const getNoticeChannels = recruitApi.getNoticeChannels;

/** 선택 채널 알림은 공개가 끝난 뒤 따로 보내므로 실패해도 공개 결과는 유지한다. */
export type PublishFormResult = { form: DynamicForm; channelNotice: "none" | "sent" | "failed" };
export const getTeacherForm = formApi.getTeacherById;
export const getFormSubmissions = formApi.getSubmissions;
export const createForm = formApi.createTeacher;
export const updateForm = formApi.updateTeacher;
// 초안 공고에 딸린 폼은 공고 공개로 함께 게시하고, 채널을 고르면 그 채널에도 공고 알림을 보낸다.
export const publishForm = async (formId: number, channelId: string | null): Promise<PublishFormResult> => {
  const recruit = (await recruitApi.getTeacherAll()).find((candidate) => candidate.formId === formId);
  if (recruit?.status !== "DRAFT") return { form: await formApi.publishTeacher(formId), channelNotice: "none" };

  const published = await recruitApi.publishTeacher(recruit.id);
  let channelNotice: PublishFormResult["channelNotice"] = "none";
  if (channelId) {
    try {
      await recruitApi.sendNoticeToChannel(published, channelId);
      channelNotice = "sent";
    } catch {
      // 공고와 폼은 이미 공개되었으므로 선택 채널 발송 실패는 결과로만 알린다.
      channelNotice = "failed";
    }
  }
  return { form: await formApi.getTeacherById(formId), channelNotice };
};
export const closeForm = formApi.closeTeacher;
