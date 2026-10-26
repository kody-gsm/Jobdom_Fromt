// 디스코드 채널 ID는 Number.MAX_SAFE_INTEGER를 넘으므로 문자열로만 다룬다.
export const RECRUIT_NOTICE_CHANNELS = [
  { id: "1564185346793672714", name: "test1" },
  { id: "1564185374937452697", name: "test2" },
  { id: "1564185448283242586", name: "test3" },
] as const;

export type RecruitNoticeChannelId = (typeof RECRUIT_NOTICE_CHANNELS)[number]["id"];

export const isRecruitNoticeChannelId = (value: string): value is RecruitNoticeChannelId =>
  RECRUIT_NOTICE_CHANNELS.some((channel) => channel.id === value);
