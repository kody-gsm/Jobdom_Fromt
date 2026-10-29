import type { createRecruitApi, Recruit } from "@fsd/entities/recruit";

type RecruitPublishApi = Pick<ReturnType<typeof createRecruitApi>, "publishTeacher" | "sendNoticeToChannel">;

/** 선택 채널 알림은 공개가 끝난 뒤 따로 보내므로 실패해도 공개 결과는 유지한다. */
export type RecruitChannelNotice = "none" | "sent" | "failed";
export type RecruitPublishResult = { recruit: Recruit; channelNotice: RecruitChannelNotice };

// 공개 시 서버가 기본 공지 채널로 알리고, 채널을 고르면 그 채널에도 공고 알림을 추가로 보낸다.
export const createPublishRecruitWithNotice = (api: RecruitPublishApi) =>
  async (recruitId: number, channelId: string | null): Promise<RecruitPublishResult> => {
    const recruit = await api.publishTeacher(recruitId);
    if (!channelId) return { recruit, channelNotice: "none" };
    try {
      await api.sendNoticeToChannel(recruit, channelId);
      return { recruit, channelNotice: "sent" };
    } catch {
      // 공고는 이미 공개되었으므로 선택 채널 발송 실패는 결과로만 알린다.
      return { recruit, channelNotice: "failed" };
    }
  };
