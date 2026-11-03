import { createFormApi } from "@fsd/entities/form";
import type { DynamicForm, FormSubmission } from "@fsd/entities/form";
import { requestWithSession } from "@fsd/entities/user";

const formApi = createFormApi(requestWithSession);

export const getTeacherForm = formApi.getTeacherById;
export const getFormSubmissions = formApi.getSubmissions;
export const getFormSubmission = formApi.getSubmission;
export const downloadFormFile = formApi.downloadFile;

export type SubmissionSheetProgress = { form: DynamicForm; submissions: FormSubmission[]; total: number };

export async function getFormSubmissionSheet(
  formId: number,
  signal: AbortSignal,
  onProgress?: (progress: SubmissionSheetProgress) => void,
) {
  const [form, summaries] = await Promise.all([getTeacherForm(formId), getFormSubmissions(formId)]);
  const submissions: FormSubmission[] = [];
  onProgress?.({ form, submissions: [], total: summaries.length });

  // 기존 상세 조회 API를 사용하되 동시에 보내는 요청 수를 제한한다.
  // 묶음마다 화면에 먼저 보여 주고, 페이지를 떠나면 진행 중인 요청도 함께 취소한다.
  for (let index = 0; index < summaries.length; index += 6) {
    signal.throwIfAborted();
    const batch = await Promise.all(summaries.slice(index, index + 6).map(({ id }) => getFormSubmission(formId, id, { signal })));
    submissions.push(...batch);
    if (index + 6 < summaries.length) onProgress?.({ form, submissions: [...submissions], total: summaries.length });
  }

  return { form, submissions };
}
