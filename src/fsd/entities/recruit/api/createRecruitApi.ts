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

// 서버는 같은 이름(image)으로 여러 장을 받는다.
const createImageBody = (images: readonly File[], fields: Record<string, string> = {}) => {
  const body = new FormData();
  images.forEach((image) => body.append("image", image));
  Object.entries(fields).forEach(([name, value]) => body.append(name, value));
  return body;
};

export const createRecruitApi = (request: RequestFn) => ({
  getAll: () => request<Recruit[]>("/recruit"),
  getById: (id: number) => request<Recruit>(`/recruit/${id}`),
  getTeacherAll: () => request<Recruit[]>("/teacher/recruit"),
  /** createForm은 공고를 처음 만들 때만 정할 수 있다. 이후 지원 폼을 추가하거나 떼어낼 수 없다. */
  createTeacher: (input: RecruitUpdate, createForm: boolean) =>
    request<Recruit>("/teacher/recruit", {
      method: "POST",
      body: JSON.stringify({ ...input, createForm }),
    }),
  analyze: (images: readonly File[], createForm: boolean) =>
    request<Recruit>("/teacher/recruit/analyze", {
      method: "POST",
      body: createImageBody(images, { createForm: String(createForm) }),
    }),
  addImages: (id: number, images: readonly File[]) =>
    request<Recruit>(`/teacher/recruit/${id}/image`, {
      method: "POST",
      body: createImageBody(images),
    }),
  deleteImage: (id: number, imageId: number) =>
    request<Recruit>(`/teacher/recruit/${id}/image/${imageId}`, { method: "DELETE" }),
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
