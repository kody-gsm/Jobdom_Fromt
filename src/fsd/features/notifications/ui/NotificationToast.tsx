"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "../model/NotificationContext.tsx";
import type { ToastNotification } from "../model/NotificationContext.tsx";

const TOAST_AUTO_DISMISS_MS = 4000;

// ─── Single Toast ─────────────────────────────────────────────────────────────

const Toast = ({ toast }: { toast: ToastNotification }) => {
  const { dismissToast } = useNotification();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.id), TOAST_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, dismissToast]);

  const handleClick = () => {
    dismissToast(toast.id);
    if (toast.targetUrl) router.push(toast.targetUrl);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      onClick={handleClick}
      className={`flex w-80 cursor-pointer flex-col gap-1 rounded-2xl bg-white px-4 py-3 shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:shadow-xl`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{toast.title}</p>
        <button
          type="button"
          aria-label="알림 닫기"
          onClick={(e) => {
            e.stopPropagation();
            dismissToast(toast.id);
          }}
          className="mt-0.5 shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          ✕
        </button>
      </div>
      {toast.content && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{toast.content}</p>
      )}
      <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-[#02C551] animate-notification-shrink" />
      </div>
    </div>
  );
};

// ─── Toast Container ──────────────────────────────────────────────────────────

export const NotificationToastContainer = () => {
  const { toasts } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="알림"
      className="fixed right-4 top-24 z-[100] flex flex-col gap-2 sm:right-6 sm:top-28 lg:right-10 lg:top-32"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
