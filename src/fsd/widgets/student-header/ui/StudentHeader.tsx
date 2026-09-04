"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut, FiUser } from "react-icons/fi";
import { logout } from "@fsd/features/logout";
import { STUDENT_NAV_ITEMS, isStudentNavActive } from "../model/navigation.ts";

export const StudentHeader = () => {
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
    <header
      className="sticky top-0 z-50 border-b border-[#EDF0F2] bg-white/95 backdrop-blur"
      style={{ fontFamily: '"Pretendard Variable", sans-serif' }}
    >
      <div className="mx-auto flex h-20 w-full max-w-[1380px] items-center justify-between px-6 lg:px-10">
        <Link href="/" aria-label="상담 대시보드로 이동" className="shrink-0">
          <Image src="/JobdamIcon.svg" alt="Jobdam" width={88} height={40} priority />
        </Link>

        <div className="flex items-center gap-8 text-sm font-semibold text-[#02C551] sm:text-base lg:gap-12">
          <nav aria-label="학생 주요 메뉴" className="flex items-center gap-8 lg:gap-12">
            {STUDENT_NAV_ITEMS.map((item) => {
              const isActive = isStudentNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`transition-opacity hover:opacity-70 ${isActive ? "font-bold" : "font-semibold"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-5 text-[#6A7077]">
            <Link href="/profile" aria-label="프로필" className="transition-colors hover:text-[#02C551]">
              <FiUser aria-hidden size={21} />
            </Link>
            <button
              type="button"
              aria-label="로그아웃"
              onClick={() => void handleLogout()}
              className="transition-colors hover:text-[#02C551]"
            >
              <FiLogOut aria-hidden size={21} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
