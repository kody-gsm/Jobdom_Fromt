import { ACTIVITY_LABELS, getActivityFilterError } from "../model/activity.ts";
import type { ActivityEvent, ActivityFilter, ActivityPage, ActivityType, ActivityUser, ActivityUsersResponse } from "../model/activity.ts";

type RequestFn = <T>(path: string, init?: RequestInit) => Promise<T>;
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const isTime = (value: unknown): value is string => typeof value === "string" && /T.*(Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
const isUser = (value: unknown): value is ActivityUser => isRecord(value)
  && isCount(value.userId) && value.userId > 0 && typeof value.name === "string"
  && typeof value.studentNumber === "string" && typeof value.role === "string" && ["STUDENT", "TEACHER", "WEE_TEACHER", "ADMIN"].includes(value.role)
  && isCount(value.pageViews) && isCount(value.actions) && isTime(value.lastActiveAt);
const isEvent = (value: unknown): value is ActivityEvent => isRecord(value)
  && typeof value.id === "string" && value.id.length > 0 && typeof value.type === "string" && Object.hasOwn(ACTIVITY_LABELS, value.type)
  && typeof value.path === "string" && value.path.startsWith("/") && value.path.length <= 200 && !/[?#]/.test(value.path) && isTime(value.occurredAt)
  && (value.durationMs === null || isCount(value.durationMs));
const isPage = <T>(value: unknown, isItem: (item: unknown) => item is T): value is ActivityPage<T> => isRecord(value)
  && Array.isArray(value.items) && value.items.length <= 20 && value.items.every(isItem) && isCount(value.page)
  && isCount(value.totalPages) && isCount(value.totalElements) && value.totalElements >= value.items.length;

const createQuery = (filter: ActivityFilter, page: number) => {
  const error = getActivityFilterError(filter);
  if (error) throw new Error(error);
  if (!isCount(page)) throw new Error("올바른 페이지를 선택해 주세요.");
  const query = new URLSearchParams({ from: filter.from, to: filter.to, page: String(page), size: "20" });
  if (filter.query.trim()) query.set("query", filter.query.trim());
  if (filter.role) query.set("role", filter.role);
  return query;
};

const requestSignal = (signal?: AbortSignal) => signal
  ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000);

export const createActivityApi = (request: RequestFn) => ({
  getUsers: async (filter: ActivityFilter, page: number, signal?: AbortSignal): Promise<ActivityUsersResponse> => {
    const result = await request<unknown>(`/admin/activity/users?${createQuery(filter, page)}`, { signal: requestSignal(signal) });
    if (!isRecord(result) || !isRecord(result.summary)
      || !isCount(result.summary.activeUsers) || !isCount(result.summary.pageViews) || !isCount(result.summary.actions)
      || !isPage(result.users, isUser)) throw new Error("활동 기록 응답 형식이 올바르지 않습니다.");
    return { summary: { activeUsers: result.summary.activeUsers, pageViews: result.summary.pageViews, actions: result.summary.actions }, users: result.users };
  },
  getEvents: async (userId: number, filter: ActivityFilter, type: ActivityType | "", page: number, signal?: AbortSignal): Promise<ActivityPage<ActivityEvent>> => {
    if (!isCount(userId) || userId === 0) throw new Error("올바른 사용자를 선택해 주세요.");
    const query = createQuery({ ...filter, query: "", role: "" }, page);
    if (type) query.set("type", type);
    const result = await request<unknown>(`/admin/activity/users/${userId}/events?${query}`, { signal: requestSignal(signal) });
    if (!isPage(result, isEvent)) throw new Error("활동 기록 응답 형식이 올바르지 않습니다.");
    return result;
  },
});
