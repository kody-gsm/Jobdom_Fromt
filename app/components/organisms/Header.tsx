'use client'

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/utils/api";
import { HomeLogoButton } from "@/app/components/atoms/HomeLogoButton";

export const Header = () => {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);
    const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const showHeader = () => setIsVisible(true);

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const isScrollingDown = currentScrollY > lastScrollY.current;
            const isAtBottom =
                window.innerHeight + currentScrollY >= document.documentElement.scrollHeight - 2;

            if (scrollEndTimer.current) {
                clearTimeout(scrollEndTimer.current);
            }

            if (currentScrollY <= 0 || isAtBottom || !isScrollingDown) {
                showHeader();
            } else {
                setIsVisible(false);
                scrollEndTimer.current = setTimeout(showHeader, 180);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);

            if (scrollEndTimer.current) {
                clearTimeout(scrollEndTimer.current);
            }
        };
    }, []);

    return (
        <>
            <div className="h-18 sm:h-20 lg:h-25" />
            <header
                className={`fixed left-0 top-0 z-50 flex h-18 w-full items-center justify-between bg-white px-4 py-4 shadow-sm transition-transform duration-300 ease-out sm:h-20 sm:px-6 lg:h-25 lg:px-10 lg:py-9 ${
                    isVisible ? "translate-y-0" : "-translate-y-full"
                }`}
            >
                <HomeLogoButton />
                <div className="flex items-center gap-4 whitespace-nowrap text-sm font-medium text-[#02C551] sm:gap-8 sm:text-base lg:gap-15 lg:text-xl">
                    <button className="cursor-pointer" type="button" onClick={() => { void logout(); router.push("/login"); }}>로그아웃</button>
                    <Link href="/profile">프로필</Link>
                </div>
            </header>
        </>
    );
}
