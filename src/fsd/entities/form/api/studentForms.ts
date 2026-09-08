import type { FormSummary } from "../model/types.ts";

interface RequestFn {
  <T>(path: string, init?: RequestInit): Promise<T>;
}

export const createStudentFormApi = (request: RequestFn) => ({
  getAll: () => request<FormSummary[]>("/form"),
});
