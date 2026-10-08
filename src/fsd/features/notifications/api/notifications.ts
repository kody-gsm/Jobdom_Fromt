import { requestWithSession as request } from "@fsd/entities/user";
import { getSafeInternalPath } from "@fsd/shared/lib";

export type NotificationType =
  | "RECRUIT_PUBLISHED"
  | "FORM_PUBLISHED"
  | "COMMON_COUNSELING_REQUESTED"
  | "COURSE_COUNSELING_REQUESTED"
  | "COUNSELING_APPROVED"
  | "COUNSELING_REJECTED"
  | "COUNSELING_AUTO_CANCELED"
  | "COUNSELING_CANCELED_BY_STUDENT"
  | "COUNSELING_EXPIRED";

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  targetId: number | null;
  targetUrl: string | null;
  isRead: boolean;
  targetStatus: string | null;
  expired: boolean;
  createdAt: string;
  expiresAt: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface SseTicketResponse {
  ticket: string;
  expiresAt: string;
}

export const getNotificationTargetUrl = (url: string | null) => {
  const safePath = getSafeInternalPath(url);
  if (!safePath) return null;
  if (/^\/teacher\/(course|common)\/\d+$/.test(safePath)) return "/teacher";
  if (/^\/student\/(course|common)\/\d+$/.test(safePath)) return "/";
  return safePath.replace(/^\/form\/(\d+)$/, "/forms/$1");
};

/**
 * 알림 클릭 시 실제로 페이지 이동해도 되는지 여부를 반환합니다.
 * expired=true이거나 대상이 삭제·취소·만료된 경우 이동하지 않습니다.
 */
export const isNotificationNavigable = (item: NotificationItem): boolean => {
  if (item.expired) return false;
  if (item.targetStatus === null || item.targetStatus === undefined) return true;
  const blockedStatuses = ["CANCELED", "DELETED", "EXPIRED", "CLOSED"];
  return !blockedStatuses.includes(item.targetStatus);
};

export const getNotifications = (page = 0, size = 20) =>
  request<PageResponse<NotificationItem>>(`/api/notifications?page=${page}&size=${size}`);

export const getUnreadCount = () =>
  request<UnreadCountResponse>("/api/notifications/unread-count");

export const markNotificationRead = (id: number) =>
  request<NotificationItem>(`/api/notifications/${id}/read`, { method: "PATCH" });

export const markAllNotificationsRead = () =>
  request<void>("/api/notifications/read-all", { method: "PATCH" });

export const issueNotificationSubscribeTicket = () =>
  request<SseTicketResponse>("/api/notifications/subscribe-ticket", { method: "POST" });
