"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getNotificationTargetUrl,
  getNotifications,
  getUnreadCount,
} from "../api/notifications.ts";
import type { NotificationItem } from "../api/notifications.ts";
import { RESERVATION_CHANGED_EVENT } from "@fsd/entities/consultation";
import { subscribeNotifications } from "../api/notificationStream.ts";
import { getSession } from "@fsd/entities/user";

export interface ToastNotification {
  id: number;
  title: string;
  content: string;
  targetUrl: string | null;
}

interface NotificationContextValue {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  clearUnread: () => void;
  notifications: NotificationItem[];
  notificationLoading: boolean;
  notificationError: string | null;
  notificationHasMore: boolean;
  retryNotifications: () => void;
  loadMoreNotifications: () => void;
  markNotificationReadLocally: (id: number) => void;
  markAllNotificationsReadLocally: () => void;
  toasts: ToastNotification[];
  dismissToast: (id: number) => void;
  pushToast: (item: NotificationItem) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const mergeNotifications = (current: NotificationItem[], incoming: NotificationItem[]) => {
  const byId = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationPage, setNotificationPage] = useState(0);
  const [notificationHasMore, setNotificationHasMore] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const unreadRequestVersion = useRef(0);
  const notificationRequestVersion = useRef(0);
  const notificationIds = useRef(new Set<number>());

  const decrementUnread = useCallback(
    () => setUnreadCount((count) => Math.max(0, count - 1)),
    [],
  );
  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const loadNotifications = useCallback(async (page = 0) => {
    const requestVersion = ++notificationRequestVersion.current;
    setNotificationLoading(true);
    setNotificationError(null);
    try {
      const result = await getNotifications(page, 20);
      if (requestVersion !== notificationRequestVersion.current) return;
      setNotifications((current) => {
        const next = page === 0 ? mergeNotifications([], result.content) : mergeNotifications(current, result.content);
        notificationIds.current = new Set(next.map((item) => item.id));
        return next;
      });
      setNotificationHasMore(!result.last);
      setNotificationPage(page);
    } catch (caught) {
      if (requestVersion === notificationRequestVersion.current) {
        setNotificationError(caught instanceof Error ? caught.message : "알림을 불러오지 못했습니다.");
      }
    } finally {
      if (requestVersion === notificationRequestVersion.current) setNotificationLoading(false);
    }
  }, []);

  const retryNotifications = useCallback(() => {
    void loadNotifications(0);
  }, [loadNotifications]);

  const loadMoreNotifications = useCallback(() => {
    if (notificationLoading || !notificationHasMore) return;
    void loadNotifications(notificationPage + 1);
  }, [loadNotifications, notificationHasMore, notificationLoading, notificationPage]);

  const markNotificationReadLocally = useCallback((id: number) => {
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
  }, []);

  const markAllNotificationsReadLocally = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  }, []);

  const pushToast = useCallback((item: NotificationItem) => {
    const isDuplicate = notificationIds.current.has(item.id);
    if (!isDuplicate) {
      notificationIds.current.add(item.id);
      setNotifications((current) => mergeNotifications(current, [item]));
      if (!item.isRead) setUnreadCount((count) => count + 1);
    }
    const toast: ToastNotification = {
      id: item.id,
      title: item.title,
      content: item.content,
      targetUrl: getNotificationTargetUrl(item.targetUrl),
    };
    setToasts((current) => current.some((entry) => entry.id === toast.id) ? current : [...current, toast]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const disconnect = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    unreadRequestVersion.current += 1;
    notificationRequestVersion.current += 1;
    notificationIds.current.clear();
    setUnreadCount(0);
    setNotifications([]);
    setNotificationPage(0);
    setNotificationHasMore(false);
    setNotificationLoading(false);
    setNotificationError(null);
    setToasts([]);
  }, []);

  const connect = useCallback(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const session = getSession();
    if (!session) return;

    void loadNotifications(0);
    const refreshCount = () => {
      const version = ++unreadRequestVersion.current;
      void getUnreadCount().then((result) => {
        if (!ctrl.signal.aborted && version === unreadRequestVersion.current) {
          setUnreadCount(result.unreadCount);
        }
      }).catch(() => undefined);
    };
    refreshCount();
    const reservationRefresh = () => {
      window.dispatchEvent(new CustomEvent(RESERVATION_CHANGED_EVENT));
    };
    const handleConnect = () => {
      refreshCount();
      reservationRefresh();
    };
    const polling = window.setInterval(refreshCount, 60_000);
    subscribeNotifications((item) => {
      if (!ctrl.signal.aborted) {
        pushToast(item);
        refreshCount();
      }
    }, handleConnect, ctrl.signal, reservationRefresh);
    ctrl.signal.addEventListener("abort", () => window.clearInterval(polling), { once: true });
  }, [loadNotifications, pushToast]);

  useEffect(() => {
    const handleSession = () => {
      if (getSession()) void connect();
      else disconnect();
    };
    handleSession();
    window.addEventListener("jobdam-session", handleSession);
    return () => {
      window.removeEventListener("jobdam-session", handleSession);
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        decrementUnread,
        clearUnread,
        notifications,
        notificationLoading,
        notificationError,
        notificationHasMore,
        retryNotifications,
        loadMoreNotifications,
        markNotificationReadLocally,
        markAllNotificationsReadLocally,
        toasts,
        dismissToast,
        pushToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
