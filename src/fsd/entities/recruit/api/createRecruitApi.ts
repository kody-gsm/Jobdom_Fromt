import type { Recruit, RecruitUpdate } from "../model/types.ts";

interface RequestFn {
  <T>(path: string, init?: RequestInit): Promise<T>;
}

export const createRecruitApi = (request: RequestFn) => ({
  getAll: () => request<Recruit[]>("/recruit"),
  getById: (id: number) => request<Recruit>(`/recruit/${id}`),
  getTeacherAll: () => request<Recruit[]>("/teacher/recruit"),
  createTeacher: (input: RecruitUpdate) =>
    request<Recruit>("/teacher/recruit", {
      method: "POST",
      body: JSON.stringify(input),
    }),
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
  publishTeacher: async (id: number) => {
    const recruit = await request<Recruit>(`/teacher/recruit/${id}/publish`, { method: "POST" });

    try {
      await request<string>("/api/notices", {
        method: "POST",
        body: JSON.stringify({
          title: `${recruit.companyName || "취업"} 공고`,
          content: recruit.summary || "새로운 취업 공고가 등록되었습니다.",
          link: typeof window !== "undefined" ? `${window.location.origin}/recruit/${recruit.id}` : undefined,
        }),
      });
    } catch (error) {
      console.error("디스코드 공고 알림 발송에 실패했습니다.", error);
    }

    return recruit;
  },
  deleteTeacher: (id: number) =>
    request<void>(`/teacher/recruit/${id}`, { method: "DELETE" }),
});
