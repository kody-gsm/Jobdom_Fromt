import type { UserRole } from "./types.ts";

export const ACTIVITY_LABELS = {
  PAGE_VIEW: "페이지 방문",
  CONSULTATION_REQUESTED: "상담 신청",
  CONSULTATION_CANCELLED: "상담 취소",
  CONSULTATION_APPROVED: "상담 승인",
  CONSULTATION_REJECTED: "상담 거절",
  CONSULTATION_SLOTS_CHANGED: "상담 시간 설정",
  FORM_SUBMITTED: "폼 제출",
  FORM_RESUBMITTED: "폼 응답 수정",
  FORM_CREATED: "폼 생성",
  FORM_UPDATED: "폼 수정",
  FORM_PUBLISHED: "폼 공개",
  FORM_CLOSED: "폼 마감",
  FORM_DELETED: "폼 삭제",
  SUBMISSION_CONFIRMED: "지원자 확정",
  SUBMISSION_UNCONFIRMED: "지원자 확정 취소",
  RECRUIT_CREATED: "공고 생성",
  RECRUIT_ANALYZED: "공고 이미지 분석",
  RECRUIT_UPDATED: "공고 수정",
  RECRUIT_PUBLISHED: "공고 공개",
  RECRUIT_DELETED: "공고 삭제",
  BANNER_UPDATED: "배너 저장",
  PROFILE_IMAGE_UPDATED: "프로필 이미지 변경",
  STUDENTS_SYNCED: "학생 정보 동기화",
} as const;

export type ActivityType = keyof typeof ACTIVITY_LABELS;
export type ActivityAction = { type: ActivityType; path: string };
export type ActivityEvent = ActivityAction & {
  id: string;
  occurredAt: string;
  durationMs: number | null;
};
export type ActivityFilter = { from: string; to: string; query: string; role: UserRole | "" };
export type ActivityUser = {
  userId: number;
  name: string;
  studentNumber: string;
  role: UserRole;
  pageViews: number;
  actions: number;
  lastActiveAt: string;
};
export type ActivityPage<T> = { items: T[]; page: number; totalPages: number; totalElements: number };
export type ActivityUsersResponse = {
  summary: { activeUsers: number; pageViews: number; actions: number };
  users: ActivityPage<ActivityUser>;
};

const ACTION_ROUTES: Array<[RegExp, ActivityType]> = [
  [/^POST \/student\/(course|common)$/, "CONSULTATION_REQUESTED"],
  [/^PATCH \/student\/(course|common)\/cancel\/\d+$/, "CONSULTATION_CANCELLED"],
  [/^PATCH \/teacher\/(course|common)\/allow\/\d+$/, "CONSULTATION_APPROVED"],
  [/^PATCH \/teacher\/(course|common)\/reject\/\d+$/, "CONSULTATION_REJECTED"],
  [/^POST \/teacher\/(course|common)\/(lock|unlock)$/, "CONSULTATION_SLOTS_CHANGED"],
  [/^POST \/student\/form\/\d+\/submission$/, "FORM_SUBMITTED"],
  [/^(PATCH|PUT) \/student\/form\/\d+\/submission$/, "FORM_RESUBMITTED"],
  [/^POST \/teacher\/form$/, "FORM_CREATED"],
  [/^PATCH \/teacher\/form\/\d+$/, "FORM_UPDATED"],
  [/^POST \/teacher\/form\/\d+\/publish$/, "FORM_PUBLISHED"],
  [/^POST \/teacher\/form\/\d+\/close$/, "FORM_CLOSED"],
  [/^DELETE \/teacher\/form\/\d+$/, "FORM_DELETED"],
  [/^POST \/teacher\/form\/\d+\/submission\/\d+\/confirm$/, "SUBMISSION_CONFIRMED"],
  [/^DELETE \/teacher\/form\/\d+\/submission\/\d+\/confirm$/, "SUBMISSION_UNCONFIRMED"],
  [/^POST \/teacher\/recruit$/, "RECRUIT_CREATED"],
  [/^POST \/teacher\/recruit\/analyze$/, "RECRUIT_ANALYZED"],
  [/^PATCH \/teacher\/recruit\/\d+$/, "RECRUIT_UPDATED"],
  [/^POST \/teacher\/recruit\/\d+\/publish$/, "RECRUIT_PUBLISHED"],
  [/^DELETE \/teacher\/recruit\/\d+$/, "RECRUIT_DELETED"],
  [/^POST \/teacher\/banner$/, "BANNER_UPDATED"],
  [/^PATCH \/auth\/profile\/image$/, "PROFILE_IMAGE_UPDATED"],
  [/^POST \/admin\/students\/sync$/, "STUDENTS_SYNCED"],
];

export const getActionActivity = (path: string, method = "GET"): ActivityAction | null => {
  const pathname = path.split(/[?#]/)[0];
  const match = ACTION_ROUTES.find(([route]) => route.test(`${method.toUpperCase()} ${pathname}`));
  return match ? { type: match[1], path: pathname } : null;
};

export const getActivityPagePath = (path: string): string | null => {
  const pathname = path.split(/[?#]/)[0];
  return /^\/$|^\/(counsel|profile|forms|recruit|admin|teacher)$|^\/(forms|recruit)\/\d+$|^\/teacher\/(forms|recruit)$|^\/teacher\/forms\/\d+\/submissions$/.test(pathname)
    ? pathname : null;
};

const isCalendarDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(value);
};

export const getActivityFilterError = (filter: Pick<ActivityFilter, "from" | "to">) => {
  if (!isCalendarDate(filter.from) || !isCalendarDate(filter.to)) return "올바른 조회 날짜를 선택해 주세요.";
  if (filter.from > filter.to) return "시작일은 종료일보다 늦을 수 없습니다.";
  return "";
};

export const getDefaultActivityFilter = (today = new Date()): ActivityFilter => {
  const koreaTime = today.getTime() + 9 * 60 * 60 * 1000;
  const to = new Date(koreaTime).toISOString().slice(0, 10);
  const from = new Date(koreaTime - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return { from, to, query: "", role: "" };
};
