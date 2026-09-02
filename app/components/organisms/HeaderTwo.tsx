"use client";

import { useRouter } from "next/navigation";
import { HomeLogoButton } from "@/app/components/atoms/HomeLogoButton";

export const HeaderTwo = () => {
    const router = useRouter();

    return (
        <div className="flex h-18 w-full items-center justify-between bg-white px-4 py-4 sm:h-20 sm:px-6 lg:h-25 lg:px-10 lg:py-9">
            <HomeLogoButton />
            <div className="cursor-pointer flex gap-15 text-[#02C551] text-xl font-medium" onClick={() => router.push("/")}>
                <p>나가기</p>
            </div>
        </div>
    );
}