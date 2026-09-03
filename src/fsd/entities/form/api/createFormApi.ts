import type {
  DynamicForm,
  FormAnswerInput,
  FormSubmission,
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
});
