import Image from "next/image";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export const AuthLayout = ({ title, description, children }: AuthLayoutProps) => (
  <main className="grid min-h-screen bg-[#F4F6F5] lg:grid-cols-[42%_58%]">
    <section className="relative hidden overflow-hidden bg-[#0F1F2D] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-16">
      <div>
        <Image
          src="/JobdamIcon.svg"
          alt="잡담"
          width={132}
          height={62}
          priority
          className="brightness-0 invert"
        />

        <div className="mt-24 max-w-[440px]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#67DD98]">
            JOBDAM FOR GSM
          </p>
          <h2 className="mt-5 text-[42px] font-bold leading-[1.2] tracking-[-0.035em]">
            취업과 상담을 한 곳에서

            <br />
            더 편하게 이어가세요.
          </h2>
          <p className="mt-6 max-w-[390px] text-[15px] leading-7 text-[#AAB6BF]">
            상담 신청부터 채용 공고와 설문까지, 학교생활에 필요한 정보를 잡담에서 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <p className="text-xs leading-6 text-[#71808C]">
        Gwangju Software Meister High School
      </p>
    </section>

    <section className="flex min-h-screen items-center justify-center bg-[#F4F6F5] px-5 py-10 sm:px-8 lg:px-12">
      <div className="w-full max-w-[520px] rounded-[24px] bg-white px-6 py-8 shadow-[0_18px_50px_rgba(15,31,45,0.08)] sm:px-10 sm:py-10">
        <div className="mb-8 lg:hidden">
          <Image src="/JobdamIcon.svg" alt="잡담" width={112} height={52} priority />
        </div>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#17201A]">
          {title}
        </h1>
        <p className="mt-3 break-keep text-sm leading-6 text-[#727A75]">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  </main>
);