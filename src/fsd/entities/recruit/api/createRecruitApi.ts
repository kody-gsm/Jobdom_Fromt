import { isRecruitNoticeChannelId } from "../config/noticeChannels.ts";
import type { RecruitNoticeChannelId } from "../config/noticeChannels.ts";
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
  // 디스코드 공지는 서버가 공개 처리와 함께 선택한 채널로 보낸다.
  publishTeacher: (id: number, channelId: RecruitNoticeChannelId) => {
    if (!isRecruitNoticeChannelId(channelId)) throw new Error("디스코드 알림 채널을 선택해주세요.");
    return request<Recruit>(`/teacher/recruit/${id}/publish`, {
      method: "POST",
      body: JSON.stringify({ channelId }),
    });
  },
  deleteTeacher: (id: number) =>
    request<void>(`/teacher/recruit/${id}`, { method: "DELETE" }),
});
