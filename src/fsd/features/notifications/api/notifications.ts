import { requestWithSession as request } from "../../../entities/user/index.ts";

export type NotificationType =
  | "RECRUIT_PUBLISHED"
  | "FORM_PUBLISHED"
  | "COMMON_COUNSELING_REQUESTED"
  | "COURSE_COUNSELING_REQUESTED"
  | "COUNSELING_APPROVED"
  | "COUNSELING_REJECTED";

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
  count: number;
}

export interface SseTicketResponse {
  ticket: string;
  expiresAt: string;
}

export const getNotificationTargetUrl = (url: string | null) => {
  if (!url) return null;
  if (/^\/teacher\/(course|common)\/\d+$/.test(url)) return "/teacher";
  if (/^\/student\/(course|common)\/\d+$/.test(url)) return "/";
  return url.replace(/^\/form\/(\d+)$/, "/forms/$1");
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
