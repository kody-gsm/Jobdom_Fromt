"use client";

import { SiteHeader } from "@fsd/widgets/site-header";
import { HomeServices } from "@fsd/widgets/home-services";
import { useHomeStage } from "../model/useHomeStage.ts";

export const HomePage = () => {
  const { stage, isHeroVisible, isServicesStage } = useHomeStage();

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-stretch justify-center overflow-hidden bg-white px-4 font-sans sm:px-6 lg:px-10">
        <section className="relative min-h-[calc(100dvh-72px)] w-full max-w-7xl sm:min-h-[calc(100dvh-80px)] lg:min-h-[calc(100dvh-100px)]">
          <div
            aria-hidden={isServicesStage}
            className={`absolute inset-0 flex items-center justify-center transition-all duration-[600ms] ease-in-out motion-reduce:transform-none ${
              stage === "hero-exit" || isServicesStage
                ? "-translate-y-4 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            <div className="mx-auto flex max-w-4xl flex-col items-center px-2 text-center">
              <p
                className={`text-sm font-bold text-[#02a946] transition-all duration-700 ${
                  isHeroVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                JOBDAM FOR GSM
              </p>
              <h1
                className={`mt-4 break-keep text-3xl font-bold leading-tight tracking-tight transition-all delay-100 duration-1000 sm:text-4xl lg:text-5xl ${
                  isHeroVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
                }`}
              >
                학생과 취업진로부 선생님을 연결하는
                <span className="mt-2 block text-[#02a946]">학교생활 통합 플랫폼</span>
              </h1>
              <p
                className={`mt-6 max-w-2xl break-keep text-sm leading-7 text-gray-500 transition-all delay-200 duration-1000 sm:text-base ${
                  isHeroVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
                }`}
              >
                진로 상담과 일반 상담, 취업 공고까지 학교에서 필요한 서비스를 한곳에서
                확인하고 이용할 수 있습니다.
              </p>
            </div>
          </div>

          <HomeServices visible={isServicesStage} />
        </section>
      </main>
    </>
  );
};
