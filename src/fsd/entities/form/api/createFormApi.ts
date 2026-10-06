import type { ApiRequestInit } from "@fsd/shared/api";
import type {
  DynamicForm,
  FormAnswerInput,
  FormFileUpload,
  FormInput,
  FormSubmission,
  FormSubmissionSummary,
  FormSummary,
} from "../model/types.ts";
import { getFormFileError, getFormInputLimitError } from "../model/validation.ts";

interface RequestFn {
  <T>(path: string, init?: ApiRequestInit): Promise<T>;
}

export const createFormApi = (request: RequestFn) => ({
  getAll: () => request<FormSummary[]>("/form"),
  getById: (id: number) => request<DynamicForm>(`/form/${id}`),
  getMySubmission: (id: number) =>
    request<FormSubmission>(`/student/form/${id}/submission`),
  submit: (id: number, answers: FormAnswerInput[]) =>
    request<FormSubmission>(`/student/form/${id}/submission`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
  updateSubmission: (id: number, answers: FormAnswerInput[]) =>
    request<FormSubmission>(`/student/form/${id}/submission`, {
      method: "PATCH",
      body: JSON.stringify({ answers }),
    }),
  uploadFile: async (id: number, file: File) => {
    const error = getFormFileError(file);
    if (error) throw new Error(error);
    const body = new FormData();
    body.append("file", file);
    return request<FormFileUpload>(`/student/form/${id}/file`, {
      method: "POST",
      body,
    });
  },
  downloadFile: async (fileId: number) => {
    if (!Number.isSafeInteger(fileId) || fileId <= 0) {
      throw new Error("첨부 파일 정보가 올바르지 않습니다.");
    }
    const file = await request<Blob>(`/form/file/${fileId}`, {
      responseType: "blob",
      signal: AbortSignal.timeout(30_000),
    });
    if (!(file instanceof Blob) || file.size === 0) {
      throw new Error("첨부 파일이 비어 있거나 파일을 불러오지 못했습니다.");
    }
    return file;
  },
  getTeacherAll: () => request<FormSummary[]>("/teacher/form"),
  getTeacherById: (id: number) => request<DynamicForm>(`/teacher/form/${id}`),
  createTeacher: async (input: FormInput) => {
    const error = getFormInputLimitError(input);
    if (error) throw new Error(error);
    return request<DynamicForm>("/teacher/form", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  updateTeacher: async (id: number, input: FormInput) => {
    const error = getFormInputLimitError(input);
    if (error) throw new Error(error);
    return request<DynamicForm>(`/teacher/form/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  publishTeacher: (id: number) =>
    request<DynamicForm>(`/teacher/form/${id}/publish`, { method: "POST" }),
  closeTeacher: (id: number) =>
    request<DynamicForm>(`/teacher/form/${id}/close`, { method: "POST" }),
  getSubmissions: (id: number) =>
    request<FormSubmissionSummary[]>(`/teacher/form/${id}/submission`),
  getSubmission: (formId: number, submissionId: number) =>
    request<FormSubmission>(`/teacher/form/${formId}/submission/${submissionId}`),
});
