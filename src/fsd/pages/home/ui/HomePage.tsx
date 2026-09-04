"use client";

import { HomeServices } from "@fsd/widgets/home-services";
import { StudentHeader } from "@fsd/widgets/student-header";
import { useHomeStage } from "../model/useHomeStage.ts";

export const HomePage = () => {
  const { stage, isHeroVisible, isServicesStage } = useHomeStage();

  return (
    <div className="min-h-dvh bg-[#F4F6F8] text-[#13233A]" style={{ fontFamily: '"Pretendard Variable", sans-serif' }}>
      <StudentHeader />
      <main className="mx-auto w-full max-w-[1380px] px-6 py-8 lg:px-10 lg:py-10">
        <section className="relative min-h-[calc(100dvh-144px)] overflow-hidden rounded-[32px]">
          <div
            aria-hidden={isServicesStage}
            className={`absolute inset-0 overflow-hidden rounded-[32px] bg-[#10243E] transition-all duration-[600ms] ease-in-out ${
              stage === "hero-exit" || isServicesStage ? "-translate-y-4 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
            <div className="absolute -bottom-32 left-20 h-96 w-96 rounded-full bg-[#1E3A5F]/70" />
            <div className="relative z-10 flex min-h-[calc(100dvh-144px)] items-center px-8 py-14 sm:px-12 lg:px-20">
              <div className="max-w-3xl">
                <p className={`text-sm font-bold tracking-[0.18em] text-[#8FB3D9] transition-all duration-700 ${isHeroVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                  JOBDAM STUDENT
                </p>
                <h1 className={`mt-5 break-keep text-4xl font-bold leading-[1.15] tracking-[-0.04em] text-white transition-all delay-100 duration-1000 sm:text-5xl lg:text-6xl ${isHeroVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
                  상담과 취업 준비를 한눈에
                  <span className="mt-3 block text-[#B9D3EC]">학생 대시보드에서 바로 시작하세요.</span>
                </h1>
                <p className={`mt-7 max-w-2xl break-keep text-base leading-8 text-[#C8D4E2] transition-all delay-200 duration-1000 ${isHeroVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
                  진로 상담, 일반 상담, 취업 공고까지 자주 사용하는 학교생활 서비스를 한곳에서 빠르게 확인할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
          <HomeServices visible={isServicesStage} />
        </section>
      </main>
    </div>
  );
};
