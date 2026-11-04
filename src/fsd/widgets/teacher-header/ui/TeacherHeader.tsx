"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { getSession, type UserRole } from "@fsd/entities/user";
import { FiLogOut } from "react-icons/fi";
import { NotificationBell } from "@fsd/features/notifications";
import { logout } from "@fsd/features/logout";

const navigation = [
  { href: "/teacher", label: "상담 일정" },
  { href: "/teacher/recruit", label: "취업 공고" },
  { href: "/teacher/forms", label: "신청 폼 관리" },
];

const subscribeRole = (listener: () => void) => {
  window.addEventListener("jobdam-session", listener);
  return () => window.removeEventListener("jobdam-session", listener);
};
const readRole = (): UserRole | null => getSession()?.role ?? null;

export function TeacherHeader() {
  const pathname = usePathname();
  const router = useRouter();
  // 페이지를 옮길 때마다 메뉴가 하나만 보였다가 늘어나지 않도록 첫 렌더부터 세션의 역할을 읽는다.
  const role = useSyncExternalStore(subscribeRole, readRole, () => null);

  const visibleNavigation = navigation.filter((item) => item.href === "/teacher" || role === "TEACHER");

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // 세션을 지우면 AuthGate도 로그인으로 보낸다. 기록이 두 번 쌓이지 않게 replace를 쓴다.
      router.replace("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-[1fr_auto] items-center px-4 sm:grid-cols-[auto_1fr_auto] sm:px-6 lg:px-8">
        <Link href="/teacher" aria-label="교사 상담 일정으로 이동" className="flex h-16 items-center sm:h-20">
          <Image src="/JobdamIcon.svg" alt="잡담" width={88} height={40} priority />
        </Link>

        <nav data-tutorial-target="navigation" aria-label="교사 주요 메뉴" className="col-span-2 row-start-2 flex h-12 items-center gap-1 border-t border-border text-xs font-semibold text-secondary-text sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:h-auto sm:justify-center sm:gap-6 sm:border-0 sm:text-base lg:gap-12">
          {visibleNavigation.map((item) => {
            const isActive = item.href === "/teacher"
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} data-tutorial-target={item.href === "/teacher/recruit" ? "nav-teacher-recruit" : item.href === "/teacher/forms" ? "nav-teacher-forms" : undefined} aria-current={isActive ? "page" : undefined} className={`flex min-w-0 flex-1 items-center justify-center break-keep text-center leading-tight sm:flex-none sm:whitespace-nowrap sm:leading-normal ${isActive ? "text-brand-accent" : "transition-colors hover:text-ink"}`}>
                {item.href === "/teacher" && role === "WEE_TEACHER" ? "wee클래스 상담" : item.label}
              </Link>
            );
          })}
        </nav>

        <div data-tutorial-target="account" className="flex items-center justify-end gap-2 text-secondary-text sm:gap-3">
          <NotificationBell />
          <Link href="/profile" className="rounded-xl px-2 py-2 text-sm font-semibold transition-colors hover:bg-surface hover:text-brand-accent sm:px-3">프로필</Link>
          <button type="button" aria-label="로그아웃" onClick={() => void handleLogout()} className="rounded-xl p-2 transition-colors hover:bg-surface hover:text-brand-accent">
            <FiLogOut aria-hidden size={21} />
          </button>
        </div>
      </div>
    </header>
  );
}
