"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import { NotificationBell } from "@fsd/features/notifications";
import { logout } from "@fsd/features/logout";

const navigation = [
  { href: "/teacher", label: "상담 일정" },
  { href: "/teacher/recruit", label: "취업 공고" },
  { href: "/teacher/forms", label: "폼 관리" },
];

export function TeacherHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-[1fr_auto] items-center px-4 sm:grid-cols-[auto_1fr_auto] sm:px-6 lg:px-8">
        <Link href="/teacher" aria-label="교사 상담 일정으로 이동" className="flex h-16 items-center sm:h-20">
          <Image src="/JobdamIcon.svg" alt="잡담" width={88} height={40} priority />
        </Link>

        <nav aria-label="교사 주요 메뉴" className="col-span-2 row-start-2 flex h-12 items-center gap-6 border-t border-border text-sm font-semibold text-secondary-text sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:h-auto sm:justify-center sm:border-0 sm:text-base lg:gap-12">
          {navigation.map((item) => {
            const isActive = item.href === "/teacher"
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined} className={isActive ? "text-brand-accent" : "transition-colors hover:text-ink"}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2 text-secondary-text sm:gap-3">
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
