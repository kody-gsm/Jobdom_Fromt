"use client";

import { useEffect, useState } from "react";
import { HomeServices } from "@fsd/widgets/home-services";
import { StudentHeader } from "@fsd/widgets/student-header";

export const HomePage = () => {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.sessionStorage.getItem("jobdam:consultation-toast");
    if (!raw) return;
    window.sessionStorage.removeItem("jobdam:consultation-toast");
    try {
      const stored = JSON.parse(raw) as { message?: string; expiresAt?: number };
      const remaining = (stored.expiresAt ?? 0) - Date.now();
      if (!stored.message || remaining <= 0) return;
      setToast(stored.message);
      const timer = window.setTimeout(() => setToast(null), remaining);
      return () => window.clearTimeout(timer);
    } catch {
      return;
    }
  }, []);

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <StudentHeader />
      {toast ? (
        <div role="status" className="fixed right-6 top-6 z-[60] rounded-2xl border border-brand bg-brand-soft px-5 py-4 text-sm font-semibold text-brand-accent shadow-lg">
          {toast}
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-[1280px] px-6 py-8 lg:px-10 lg:py-10">
        <HomeServices />
      </main>
    </div>
  );
};
