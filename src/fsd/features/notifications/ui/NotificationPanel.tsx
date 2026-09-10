"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  getNotificationTargetUrl,
  markAllNotificationsRead,
  markNotificationRead,
  NotificationItem,
  NotificationType,
} from "../api/notifications.ts";
import { useNotification } from "../model/NotificationContext.tsx";
import { formatNotificationTime } from "../model/time.ts";

// ─── Label helpers ────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<NotificationType, string> = {
  RECRUIT_PUBLISHED: "채용공고",
  FORM_PUBLISHED: "설문",
  COMMON_COUNSELING_REQUESTED: "일반상담",
  COURSE_COUNSELING_REQUESTED: "진로상담",
  COUNSELING_APPROVED: "상담 승인",
  COUNSELING_REJECTED: "상담 거절",
};

const TYPE_COLORS: Record<NotificationType, string> = {
  RECRUIT_PUBLISHED: "bg-blue-100 text-blue-700",
  FORM_PUBLISHED: "bg-purple-100 text-purple-700",
  COMMON_COUNSELING_REQUESTED: "bg-yellow-100 text-yellow-700",
  COURSE_COUNSELING_REQUESTED: "bg-orange-100 text-orange-700",
  COUNSELING_APPROVED: "bg-green-100 text-green-700",
  COUNSELING_REJECTED: "bg-red-100 text-red-700",
};

// ─── NotificationItem row ─────────────────────────────────────────────────────

const NotificationRow = ({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: number) => void;
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (!item.isRead) onRead(item.id);
    const targetUrl = getNotificationTargetUrl(item.targetUrl);
    if (targetUrl) router.push(targetUrl);
  };

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={`w-full text-left px-4 py-3 flex gap-3 items-start transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50 ${
          item.isRead ? "opacity-60" : ""
        }`}
      >
        {/* unread dot */}
        <span
          aria-hidden="true"
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
            item.isRead ? "bg-transparent" : "bg-[#02C551]"
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                TYPE_COLORS[item.type]
              }`}
            >
              {TYPE_LABELS[item.type]}
            </span>
            <span className="text-[11px] text-gray-400 ml-auto shrink-0">
              {formatNotificationTime(item.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-gray-900 leading-snug truncate">
            {item.title}
          </p>
          {item.content && (
            <p className="mt-0.5 text-xs text-gray-500 leading-relaxed line-clamp-2">
              {item.content}
            </p>
          )}
        </div>
      </button>
    </li>
  );
};

// ─── Panel ────────────────────────────────────────────────────────────────────

interface NotificationPanelProps {
  onClose: () => void;
}

export const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  const { clearUnread, decrementUnread, setUnreadCount } = useNotification();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const initialFetched = useRef(false);
  const readingIds = useRef(new Set<number>());

  // close panel when clicking outside
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [onClose]);

  const fetchPage = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNotifications(pageNum, 20);
      if (pageNum === 0) {
        setItems(result.content);
      } else {
        setItems((prev) => [...prev, ...result.content]);
      }
      setHasMore(!result.last);
      setPage(pageNum);
    } catch {
      setError("알림을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialFetched.current) {
      initialFetched.current = true;
      void fetchPage(0);
    }
  }, [fetchPage]);

  const handleRead = useCallback(
    async (id: number) => {
      if (readingIds.current.has(id)) return;
      readingIds.current.add(id);
      try {
        await markNotificationRead(id);
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        decrementUnread();
      } catch {
        setError("알림 읽음 처리에 실패했습니다.");
      } finally {
        readingIds.current.delete(id);
      }
    },
    [decrementUnread],
  );


  const handleReadAll = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      clearUnread();
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, [clearUnread, setUnreadCount]);

  const unreadInList = items.filter((n) => !n.isRead).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl bg-white shadow-xl ring-1 ring-black/10 flex flex-col overflow-hidden z-50"
      role="dialog"
      aria-label="알림 목록"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-bold text-gray-900">알림</span>
        {unreadInList > 0 && (
          <button
            type="button"
            onClick={handleReadAll}
            className="text-xs text-[#02C551] font-medium hover:underline focus:outline-none"
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto overscroll-contain">
        {error && (
          <p className="p-4 text-sm text-red-500 text-center">{error}</p>
        )}

        {!error && items.length === 0 && !loading && (
          <p className="p-8 text-sm text-gray-400 text-center">알림이 없습니다</p>
        )}

        {items.length > 0 && (
          <ul className="divide-y divide-gray-50">
            {items.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onRead={handleRead}
              />
            ))}
          </ul>
        )}

        {hasMore && (
          <div className="p-3 text-center">
            <button
              type="button"
              onClick={() => void fetchPage(page + 1)}
              disabled={loading}
              className="text-xs text-[#02C551] font-medium hover:underline disabled:opacity-50 focus:outline-none"
            >
              {loading ? "불러오는 중…" : "더 보기"}
            </button>
          </div>
        )}

        {loading && items.length === 0 && (
          <div className="flex justify-center py-8">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#02C551] border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
};
