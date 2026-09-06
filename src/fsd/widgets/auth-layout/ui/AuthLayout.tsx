import Image from "next/image";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export const AuthLayout = ({ title, description, children }: AuthLayoutProps) => (
  <main className="flex min-h-screen items-center justify-center bg-[#F4F6F5] px-5 py-10 sm:px-8">
    <section className="w-full max-w-[520px] rounded-[24px] bg-white px-6 py-8 shadow-[0_18px_50px_rgba(15,31,45,0.08)] sm:px-10 sm:py-10">
      <div className="mb-8 flex justify-center">
        <Image
          src="/JobdamIcon.svg"
          alt="잡담"
          width={132}
          height={67}
          priority
          className="h-auto w-[132px]"
        />
      </div>
      {title ? (
        <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#17201A]">{title}</h1>
      ) : null}
      {description ? (
        <p className="mt-3 break-keep text-sm leading-6 text-[#727A75]">{description}</p>
      ) : null}
      <div className={title || description ? "mt-8" : ""}>{children}</div>
    </section>
  </main>
);
