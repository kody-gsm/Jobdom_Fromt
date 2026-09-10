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
  getUnreadCount,
  getNotificationTargetUrl,
  NotificationItem,
} from "../api/notifications.ts";

import { subscribeNotifications } from "../api/notificationStream.ts";

import { getSession } from "@fsd/entities/user";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  toasts: ToastNotification[];
  dismissToast: (id: number) => void;
  pushToast: (item: NotificationItem) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const unreadRequestVersion = useRef(0);

  const decrementUnread = useCallback(
    () => setUnreadCount((c) => Math.max(0, c - 1)),
    [],
  );
  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const pushToast = useCallback((item: NotificationItem) => {
    const toast: ToastNotification = {
      id: item.id,
      title: item.title,
      content: item.content,
      targetUrl: getNotificationTargetUrl(item.targetUrl),
    };
    setToasts((prev) => [...prev, toast]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── SSE connect / disconnect ───────────────────────────────────────────────

  const disconnect = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    unreadRequestVersion.current += 1;
    setUnreadCount(0);
    setToasts([]);
  }, []);

  const connect = useCallback(() => {
    abortRef.current?.abort();

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const session = getSession();
    if (!session) return;

    const refreshCount = () => {
      const version = ++unreadRequestVersion.current;
      void getUnreadCount().then((result) => {
        if (!ctrl.signal.aborted && version === unreadRequestVersion.current) {
          setUnreadCount(result.count);
        }
      }).catch(() => undefined);
    };
    refreshCount();
    const polling = window.setInterval(refreshCount, 60_000);
    subscribeNotifications((item) => {
      if (!ctrl.signal.aborted) {
        if (!item.isRead) setUnreadCount((c) => c + 1);
        pushToast(item);
        refreshCount();
      }
    }, refreshCount, ctrl.signal);
    ctrl.signal.addEventListener("abort", () => window.clearInterval(polling), { once: true });
  }, [pushToast]);

  // ── React to session changes ───────────────────────────────────────────────

  useEffect(() => {
    const handleSession = () => {
      const session = getSession();
      if (session) {
        void connect();
      } else {
        disconnect();
      }
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
        toasts,
        dismissToast,
        pushToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
