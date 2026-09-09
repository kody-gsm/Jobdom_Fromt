"use client";

import { NotificationBell } from "@fsd/features/notifications";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import {
  getProfileAvatarUserKey,
  getSession,
  PROFILE_AVATAR_CHANGED_EVENT,
  readProfileAvatar,
} from "@fsd/entities/user";
import { logout } from "@fsd/features/logout";
import { STUDENT_NAV_ITEMS, isStudentNavActive } from "../model/navigation.ts";

export const StudentHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    const userKey = getProfileAvatarUserKey({
      email: session?.email,
      name: session?.name,
    });
    const syncAvatar = () => setProfileAvatar(readProfileAvatar(userKey));

    syncAvatar();    window.addEventListener(PROFILE_AVATAR_CHANGED_EVENT, syncAvatar);
    return () => {
      window.removeEventListener(PROFILE_AVATAR_CHANGED_EVENT, syncAvatar);
    };
  }, []);

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

    >
      <div className="mx-auto grid w-full max-w-[1380px] grid-cols-[1fr_auto] items-center px-4 sm:grid-cols-[auto_1fr_auto] sm:px-6 lg:px-10">
        <Link
          href="/"
          aria-label="상담 대시보드로 이동"
          className="flex h-16 shrink-0 items-center sm:h-20"
        >
          <Image src="/JobdamIcon.svg" alt="Jobdam" width={64} height={32} priority />
        </Link>

        <nav          aria-label="학생 주요 메뉴"
          className="col-span-2 row-start-2 flex h-12 items-center gap-1 border-t border-[#EDF0F2] text-sm font-semibold text-[#607089] sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:h-auto sm:justify-center sm:gap-8 sm:border-t-0 sm:text-base lg:gap-12"
        >
          {STUDENT_NAV_ITEMS.map((item) => {
            const isActive = isStudentNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-full flex-1 items-center justify-center whitespace-nowrap text-center transition-colors hover:text-brand-accent sm:h-11 sm:flex-none ${isActive ? "font-bold text-brand" : "font-semibold"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="col-start-2 row-start-1 flex items-center justify-self-end gap-5 text-[#6A7077] sm:col-start-3">
          <NotificationBell />
          <Link
            href="/profile"
            aria-label="프로필"
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl transition-colors hover:bg-surface"
          >
            {profileAvatar ? (
              <Image
                src={profileAvatar}
                alt="프로필"
                width={32}
                height={32}                unoptimized
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <Image
                src="/profileIcon.svg"
                alt=""
                width={18}
                height={18}
                aria-hidden="true"
              />
            )}
          </Link>
          <button
            type="button"
            aria-label="로그아웃"
            onClick={() => void handleLogout()}
            className="flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:bg-surface hover:text-brand-accent"
          >
            <FiLogOut aria-hidden size={21} />
          </button>
        </div>
      </div>
    </header>
  );
};
