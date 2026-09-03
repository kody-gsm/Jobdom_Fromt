import type {
  DynamicForm,
  FormAnswerInput,
  FormInput,
  FormSubmission,
  FormSubmissionSummary,
  FormSummary,
} from "../model/types.ts";

interface RequestFn {
  <T>(path: string, init?: RequestInit): Promise<T>;
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
  getTeacherAll: () => request<FormSummary[]>("/teacher/form"),
  getTeacherById: (id: number) => request<DynamicForm>(`/teacher/form/${id}`),
  createTeacher: (input: FormInput) =>
    request<DynamicForm>("/teacher/form", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateTeacher: (id: number, input: FormInput) =>
    request<DynamicForm>(`/teacher/form/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  publishTeacher: (id: number) =>
    request<DynamicForm>(`/teacher/form/${id}/publish`, { method: "POST" }),
  closeTeacher: (id: number) =>
    request<DynamicForm>(`/teacher/form/${id}/close`, { method: "POST" }),
  getSubmissions: (id: number) =>
    request<FormSubmissionSummary[]>(`/teacher/form/${id}/submission`),
  getSubmission: (formId: number, submissionId: number) =>
    request<FormSubmission>(`/teacher/form/${formId}/submission/${submissionId}`),
});
