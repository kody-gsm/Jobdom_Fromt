"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getSession } from "@fsd/entities/user";
import { logout } from "@fsd/features/logout";

export const SiteHeader = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollEndTimer = useRef<number | null>(null);

  useEffect(() => {
    const showHeader = () => setIsVisible(true);
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY.current;
      const isAtBottom =
        window.innerHeight + currentScrollY >= document.documentElement.scrollHeight - 2;

      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);

      if (currentScrollY <= 0 || isAtBottom || !isScrollingDown) {
        showHeader();
      } else {
        setIsVisible(false);
        scrollEndTimer.current = window.setTimeout(showHeader, 180);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
    };
  }, []);

  const handleLogoClick = () => {
    if (getSession()?.role === "STUDENT") router.push("/");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  };

  return (
    <>
      <div className="h-18 sm:h-20 lg:h-25" />
      <header
        className={`fixed left-0 top-0 z-50 flex h-18 w-full items-center justify-between bg-white px-4 py-4 shadow-sm transition-transform duration-300 ease-out sm:h-20 sm:px-6 lg:h-25 lg:px-10 lg:py-9 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <button
          type="button"
          aria-label="메인 페이지로 이동"
          onClick={handleLogoClick}
          className="cursor-pointer"
        >
          <Image
            src="/JobdamIcon.svg"
            alt="잡담"
            width={64}
            height={33}
            className="h-auto w-14 sm:w-16"
          />
        </button>
        <div className="flex items-center gap-4 whitespace-nowrap text-sm font-medium text-[#02C551] sm:gap-8 sm:text-base lg:gap-15 lg:text-xl">
          <button
            className="cursor-pointer"
            type="button"
            onClick={() => void handleLogout()}
          >
            로그아웃
          </button>
          <Link href="/profile">프로필</Link>
        </div>
      </header>
    </>
  );
};
