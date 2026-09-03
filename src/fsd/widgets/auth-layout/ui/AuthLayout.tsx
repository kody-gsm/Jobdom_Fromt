import Image from "next/image";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export const AuthLayout = ({ title, description, children }: AuthLayoutProps) => (
  <main className="min-h-screen bg-[#f6f8f7] px-4 py-6 sm:px-6 lg:px-8">
    <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[32px] border border-[#e4ebe6] bg-white shadow-[0_24px_80px_rgba(31,64,43,0.08)] lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-[#02C551] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="inline-flex rounded-2xl bg-white p-3">
            <Image src="/JobdamIcon.svg" alt="잡담" width={126} height={60} priority />
          </div>
          <p className="mt-10 max-w-sm text-4xl font-bold leading-[1.2] tracking-tight">
            학교생활과 진로 고민을 한 곳에서 연결합니다.
          </p>
          <p className="mt-5 max-w-md text-sm leading-7 text-green-50">
            상담 신청부터 취업 정보까지, 학생과 선생님이 같은 흐름에서 소통할 수 있도록 돕습니다.
          </p>
        </div>        <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-green-50">
          <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-3">상담</span>
          <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-3">취업</span>
          <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-3">신청 폼</span>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="w-full max-w-[520px]">
          <div className="mb-9 lg:hidden">
            <Image src="/JobdamIcon.svg" alt="잡담" width={132} height={62} priority />
          </div>
          <p className="text-sm font-bold text-[#02a946]">JOBDAM</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#17201a] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 break-keep text-sm leading-6 text-[#6f7771]">{description}</p>
          <div className="mt-9">{children}</div>
        </div>
      </section>
    </div>
  </main>
);
