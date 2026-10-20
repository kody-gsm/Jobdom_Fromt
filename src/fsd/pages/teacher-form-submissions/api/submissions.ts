import { createFormApi } from "@fsd/entities/form";
import type { FormSubmission } from "@fsd/entities/form";
import { requestWithSession } from "@fsd/entities/user";

const formApi = createFormApi(requestWithSession);

export const getTeacherForm = formApi.getTeacherById;
export const getFormSubmissions = formApi.getSubmissions;
export const getFormSubmission = formApi.getSubmission;
export const downloadFormFile = formApi.downloadFile;

export async function getFormSubmissionSheet(formId: number, signal: AbortSignal) {
  const [form, summaries] = await Promise.all([getTeacherForm(formId), getFormSubmissions(formId)]);
  const submissions: FormSubmission[] = [];

  // 기존 상세 조회 API를 사용하되 동시에 보내는 요청 수를 제한한다.
  for (let index = 0; index < summaries.length; index += 6) {
    signal.throwIfAborted();
    const batch = await Promise.all(summaries.slice(index, index + 6).map(({ id }) => getFormSubmission(formId, id)));
    submissions.push(...batch);
  }

  return { form, submissions };
}
