"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSession } from "@fsd/entities/user";

type HomeLogoButtonProps = {
  className?: string;
};

export const HomeLogoButton = ({ className = "" }: HomeLogoButtonProps) => {
  const router = useRouter();
  const handleClick = () => {
    if (getSession()?.role === "STUDENT") router.push("/");
  };

  return (
    <button
      type="button"
      aria-label="메인 페이지로 이동"
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
    >
      <Image
        src="/JobdamIcon.svg"
        alt="잡담"
        width={64}
        height={33}
        className="h-auto w-14 sm:w-16"
      />
    </button>
  );
};
