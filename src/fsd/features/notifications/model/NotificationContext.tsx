"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getNotificationTargetUrl,
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
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

type NotificationActions = {
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  clearUnread: () => void;
  loadNotifications: (page?: number) => Promise<void>;
  retryNotifications: () => void;
  loadMoreNotifications: () => void;
  markNotificationReadLocally: (id: number) => void;
  markAllNotificationsReadLocally: () => void;
  readNotification: (id: number) => Promise<void>;
  readAllNotifications: () => Promise<void>;
  dismissToast: (id: number) => void;
  pushToast: (item: NotificationItem) => void;
};

type NotificationList = {
  notifications: NotificationItem[];
  notificationLoading: boolean;
  notificationLoaded: boolean;
  notificationError: string | null;
  notificationHasMore: boolean;
};

const UnreadCountContext = createContext<number | null>(null);
const NotificationListContext = createContext<NotificationList | null>(null);
const NotificationToastsContext = createContext<ToastNotification[] | null>(null);
const NotificationActionsContext = createContext<NotificationActions | null>(null);

const mergeNotifications = (current: NotificationItem[], incoming: NotificationItem[]) => {
  const byId = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) byId.set(item.id, item);
  return [...byId.values()].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
};

export const useNotificationUnreadCount = () => {
  const value = useContext(UnreadCountContext);
  if (value === null) throw new Error("useNotificationUnreadCount must be used within NotificationProvider");
  return value;
};

export const useNotificationList = () => {
  const value = useContext(NotificationListContext);
  if (!value) throw new Error("useNotificationList must be used within NotificationProvider");
  return value;
};

export const useNotificationToasts = () => {
  const value = useContext(NotificationToastsContext);
  if (!value) throw new Error("useNotificationToasts must be used within NotificationProvider");
  return value;
};

export const useNotificationActions = () => {
  const value = useContext(NotificationActionsContext);
  if (!value) throw new Error("useNotificationActions must be used within NotificationProvider");
  return value;
};

// Retain the combined hook for existing callers; UI consumers subscribe narrowly.
export const useNotification = () => {
  const unreadCount = useNotificationUnreadCount();
  const list = useNotificationList();
  const toasts = useNotificationToasts();
  const actions = useNotificationActions();
  return { unreadCount, ...list, toasts, ...actions };
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationLoaded, setNotificationLoaded] = useState(false);
  const [notificationHasMore, setNotificationHasMore] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const notificationRequestVersion = useRef(0);
  const notificationIds = useRef(new Set<number>());
  const notificationLoadedRef = useRef(false);
  const pagination = useRef({ page: 0, hasMore: false, loading: false });
  const notificationReads = useRef({ ids: new Set<number>(), all: false });
  const refreshCountRef = useRef<(() => void) | null>(null);

  const decrementUnread = useCallback(
    () => setUnreadCount((count) => Math.max(0, count - 1)),
    [],
  );
  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const loadNotifications = useCallback(async (page = 0) => {
    const ctrl = abortRef.current;
    if (!ctrl || ctrl.signal.aborted) return;
    const requestVersion = ++notificationRequestVersion.current;
    pagination.current.loading = true;
    setNotificationLoading(true);
    setNotificationError(null);
    try {
      const result = await getNotifications(page, 20, { cache: "no-store", signal: ctrl.signal });
      if (ctrl.signal.aborted || requestVersion !== notificationRequestVersion.current) return;
      const shouldReplace = page === 0 && notificationLoadedRef.current;
      setNotifications((current) => {
        const next = shouldReplace
          ? mergeNotifications([], result.content)
          : mergeNotifications(current, result.content);
        notificationIds.current = new Set(next.map((item) => item.id));
        return next;
      });
      if (page === 0) {
        notificationLoadedRef.current = true;
        setNotificationLoaded(true);
      }
      setNotificationHasMore(!result.last);
      pagination.current.page = page;
      pagination.current.hasMore = !result.last;
    } catch (caught) {
      if (!ctrl.signal.aborted && requestVersion === notificationRequestVersion.current) {
        setNotificationError(caught instanceof Error ? caught.message : "알림을 불러오지 못했습니다.");
      }
    } finally {
      if (!ctrl.signal.aborted && requestVersion === notificationRequestVersion.current) {
        pagination.current.loading = false;
        setNotificationLoading(false);
      }
    }
  }, []);

  const retryNotifications = useCallback(() => {
    void loadNotifications(0);
  }, [loadNotifications]);

  const loadMoreNotifications = useCallback(() => {
    const { loading, hasMore, page } = pagination.current;
    if (loading || !hasMore) return;
    void loadNotifications(page + 1);
  }, [loadNotifications]);

  const markNotificationReadLocally = useCallback((id: number) => {
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, isRead: true } : item));
  }, []);

  const markAllNotificationsReadLocally = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
  }, []);

  const readNotification = useCallback(async (id: number) => {
    const ctrl = abortRef.current;
    const reading = notificationReads.current;
    if (!ctrl || ctrl.signal.aborted || reading.ids.has(id)) return;
    reading.ids.add(id);
    try {
      await markNotificationRead(id);
      if (ctrl.signal.aborted) return;
      markNotificationReadLocally(id);
      decrementUnread();
      refreshCountRef.current?.();
    } catch {
      if (!ctrl.signal.aborted) retryNotifications();
    } finally {
      reading.ids.delete(id);
    }
  }, [decrementUnread, markNotificationReadLocally, retryNotifications]);

  const readAllNotifications = useCallback(async () => {
    const ctrl = abortRef.current;
    const reading = notificationReads.current;
    if (!ctrl || ctrl.signal.aborted || reading.all) return;
    reading.all = true;
    try {
      await markAllNotificationsRead();
      if (ctrl.signal.aborted) return;
      markAllNotificationsReadLocally();
      clearUnread();
      refreshCountRef.current?.();
    } catch {
      if (!ctrl.signal.aborted) retryNotifications();
    } finally {
      reading.all = false;
    }
  }, [clearUnread, markAllNotificationsReadLocally, retryNotifications]);

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
    refreshCountRef.current = null;
    notificationRequestVersion.current += 1;
    notificationIds.current.clear();
    notificationLoadedRef.current = false;
    pagination.current = { page: 0, hasMore: false, loading: false };
    notificationReads.current = { ids: new Set<number>(), all: false };
    setUnreadCount(0);
    setNotifications([]);
    setNotificationLoaded(false);
    setNotificationHasMore(false);
    setNotificationLoading(false);
    setNotificationError(null);
    setToasts([]);
  }, []);

  const connect = useCallback(() => {
    disconnect();
    if (!getSession()) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let countInFlight = false;
    let countRefreshQueued = false;
    const refreshCount = () => {
      if (ctrl.signal.aborted) return;
      if (countInFlight) {
        countRefreshQueued = true;
        return;
      }
      countInFlight = true;
      void getUnreadCount({ cache: "no-store", signal: ctrl.signal }).then((result) => {
        if (!ctrl.signal.aborted && !countRefreshQueued) {
          setUnreadCount(result.unreadCount);
        }
      }).catch(() => {
        // Keep the current count on background failure; queued work/polling retries.
      }).finally(() => {
        countInFlight = false;
        if (!ctrl.signal.aborted && countRefreshQueued) {
          countRefreshQueued = false;
          refreshCount();
        }
      });
    };
    refreshCountRef.current = refreshCount;
    refreshCount();
    const reservationRefresh = () => {
      if (ctrl.signal.aborted) return;
      window.dispatchEvent(new CustomEvent(RESERVATION_CHANGED_EVENT));
    };
    const handleConnect = (isReconnect: boolean) => {
      if (ctrl.signal.aborted) return;
      if (isReconnect) refreshCount();
      reservationRefresh();
      // 목록을 한 번 연 뒤 SSE가 재연결되면 놓친 알림을 다시 가져옵니다.
      if (isReconnect && notificationLoadedRef.current) void loadNotifications(0);
    };
    const polling = window.setInterval(refreshCount, 60_000);
    subscribeNotifications((item) => {
      if (!ctrl.signal.aborted) {
        pushToast(item);
        refreshCount();
      }
    }, handleConnect, ctrl.signal, reservationRefresh);
    ctrl.signal.addEventListener("abort", () => window.clearInterval(polling), { once: true });
  }, [disconnect, loadNotifications, pushToast]);

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

  const actions = useMemo<NotificationActions>(() => ({
    setUnreadCount,
    decrementUnread,
    clearUnread,
    loadNotifications,
    retryNotifications,
    loadMoreNotifications,
    markNotificationReadLocally,
    markAllNotificationsReadLocally,
    readNotification,
    readAllNotifications,
    dismissToast,
    pushToast,
  }), [
    decrementUnread, clearUnread, loadNotifications, retryNotifications,
    loadMoreNotifications, markNotificationReadLocally, markAllNotificationsReadLocally,
    readNotification, readAllNotifications, dismissToast, pushToast,
  ]);
  const list = useMemo<NotificationList>(() => ({
    notifications,
    notificationLoaded,
    notificationLoading,
    notificationError,
    notificationHasMore,
  }), [notifications, notificationLoaded, notificationLoading, notificationError, notificationHasMore]);

  return (
    <NotificationActionsContext.Provider value={actions}>
      <UnreadCountContext.Provider value={unreadCount}>
        <NotificationListContext.Provider value={list}>
          <NotificationToastsContext.Provider value={toasts}>
            {children}
          </NotificationToastsContext.Provider>
        </NotificationListContext.Provider>
      </UnreadCountContext.Provider>
    </NotificationActionsContext.Provider>
  );
};
