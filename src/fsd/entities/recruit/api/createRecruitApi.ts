import { formatRecruitFields } from "../model/fields.ts";
import type { Recruit, RecruitNoticeChannel, RecruitUpdate } from "../model/types.ts";

interface RequestFn {
  <T>(path: string, init?: RequestInit): Promise<T>;
}

const isNoticeChannel = (value: unknown): value is RecruitNoticeChannel =>
  typeof value === "object" && value !== null
  && "id" in value && typeof value.id === "string" && /^\d+$/.test(value.id)
  && "name" in value && typeof value.name === "string"
  && "categoryName" in value && (value.categoryName === null || typeof value.categoryName === "string");

// 서버가 기본 공지 채널에 보내는 공고 알림과 같은 내용으로 맞춘다.
const createRecruitNotice = (recruit: Recruit) => ({
  title: `${recruit.companyName || "채용"} 공고`,
  content: recruit.summary?.trim() || "새로운 취업 공고가 등록되었습니다.",
  field: formatRecruitFields(recruit.fields),
  link: typeof window === "undefined" ? undefined : `${window.location.origin}/recruit/${recruit.id}`,
});

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
  // 공개 시 서버가 기본 공지 채널로 알림을 보낸다.
  publishTeacher: (id: number) =>
    request<Recruit>(`/teacher/recruit/${id}/publish`, { method: "POST" }),
  getNoticeChannels: async (signal?: AbortSignal) => {
    const result = await request<unknown>("/api/notices/channels", { signal });
    if (!Array.isArray(result) || !result.every(isNoticeChannel)) {
      throw new Error("디스코드 채널 목록 응답 형식이 올바르지 않습니다.");
    }
    return result;
  },
  /** 공개된 공고 알림을 선택한 디스코드 채널에 추가로 보내고 메시지 ID를 돌려준다. */
  sendNoticeToChannel: (recruit: Recruit, channelId: string) => {
    if (!/^\d+$/.test(channelId)) throw new Error("디스코드 알림 채널을 다시 선택해주세요.");
    return request<string>("/api/notices/send", {
      method: "POST",
      body: JSON.stringify({ channelId, ...createRecruitNotice(recruit) }),
    });
  },
  deleteTeacher: (id: number) =>
    request<void>(`/teacher/recruit/${id}`, { method: "DELETE" }),
});
