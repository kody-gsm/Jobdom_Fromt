import type { Recruit, RecruitUpdate } from "../model/types.ts";

interface RequestFn {
  <T>(path: string, init?: RequestInit): Promise<T>;
}

export const createRecruitApi = (request: RequestFn) => ({
  getAll: () => request<Recruit[]>("/recruit"),
  getById: (id: number) => request<Recruit>(`/recruit/${id}`),
  getTeacherAll: () => request<Recruit[]>("/teacher/recruit"),
  analyze: (image: File) => {
    const body = new FormData();
    body.append("image", image);
    return request<Recruit>("/teacher/recruit/analyze", {
      method: "POST",
      body,
    });
  },
  updateTeacher: (id: number, input: RecruitUpdate) =>
    request<Recruit>(`/teacher/recruit/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  publishTeacher: (id: number) =>
    request<Recruit>(`/teacher/recruit/${id}/publish`, { method: "POST" }),
});
