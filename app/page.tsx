'use client'

import { useEffect, useState } from "react";
import { IoMdChatbubbles } from "react-icons/io";
import { PiTextAlignLeftFill } from "react-icons/pi";
import { FaBriefcase } from "react-icons/fa";
import Link from "next/link";
import { Header } from "./components/organisms";

type HomeStage = "hero" | "hero-exit" | "services";

const HERO_ANIMATION_MS = 1200;
const HERO_HOLD_MS = 2000;
const HERO_EXIT_MS = 600;

export default function Home() {
  const [stage, setStage] = useState<HomeStage>("hero");
  const [isHeroVisible, setIsHeroVisible] = useState(false);

  useEffect(() => {
    const entranceFrame = window.requestAnimationFrame(() => {
      setIsHeroVisible(true);
    });

    const exitTimer = window.setTimeout(() => {
      setStage("hero-exit");
    }, HERO_ANIMATION_MS + HERO_HOLD_MS);

    const servicesTimer = window.setTimeout(() => {
      setStage("services");
    }, HERO_ANIMATION_MS + HERO_HOLD_MS + HERO_EXIT_MS);

    return () => {
      window.cancelAnimationFrame(entranceFrame);
      window.clearTimeout(exitTimer);
      window.clearTimeout(servicesTimer);
    };
  }, []);

  const isServicesStage = stage === "services";

  return (
    <>
      <Header />
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
            <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-5 px-1 sm:gap-6 sm:px-4">
              <h1
                className={`break-keep text-center text-3xl font-bold leading-[1.25] tracking-tighter transition-all duration-1000 ease-out motion-reduce:transform-none motion-reduce:transition-none sm:text-4xl lg:text-5xl ${
                  isHeroVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
                }`}
              >
                진로 상담, 일반 상담 등
                <span className="mt-2 block sm:mt-3">
                  학생, 취업진로부 선생님 통합 플랫폼
                </span>
              </h1>
              <p
                className={`max-w-3xl break-keep text-center text-sm font-light leading-6 text-gray-400 transition-all delay-200 duration-1000 ease-out motion-reduce:transform-none motion-reduce:transition-none sm:text-base sm:leading-7 lg:text-lg ${
                  isHeroVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
                }`}
              >
                진로 상담과 일반 상담을 통해 학생들의 학교생활과 진로 고민을 돕습니다.
                학생들이 자신의 진로를 차분히 준비할 수 있도록 함께합니다.
              </p>
            </div>
          </div>

          <div
            aria-hidden={!isServicesStage}
            className={`absolute inset-0 overflow-y-auto py-8 transition-opacity duration-500 sm:py-10 lg:overflow-hidden ${
              isServicesStage ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="flex min-h-full w-full items-start justify-center lg:items-center">
              <div className="w-full">
                <h2
                  id="services-title"
                  className={`break-keep text-center text-2xl font-bold transition-all duration-700 ease-out motion-reduce:transform-none sm:text-3xl lg:text-4xl ${
                    isServicesStage ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                >
                  잡담에서 지원하는 서비스
                </h2>

                <div className="mt-10 grid w-full grid-cols-1 gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
                  <article
                    className={`flex min-h-[320px] w-full flex-col items-center rounded-3xl bg-green-200/70 px-6 py-8 text-center transition-all delay-[150ms] duration-700 ease-out motion-reduce:transform-none sm:min-h-[340px] sm:p-8 lg:min-h-[360px] lg:px-6 xl:p-10 ${
                      isServicesStage ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                    }`}
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white sm:h-20 sm:w-20 sm:rounded-3xl">
                      <IoMdChatbubbles
                        aria-hidden="true"
                        className="h-9 w-9 fill-green-600 text-green-600 sm:h-11 sm:w-11"
                        strokeWidth={5}
                      />
                    </div>
                    <div className="mt-6 flex flex-1 flex-col items-center sm:mt-8">
                      <h3 className="text-xl font-bold sm:text-2xl">진로 상담 신청</h3>
                      <p className="mt-3 max-w-sm break-keep text-sm font-light leading-6 text-gray-600">
                        진로 탐색 및 진학 취업과 관련된 상담을 통해 개인의 적성과 목표에
                        맞는 방향을 설정할 수 있습니다.
                      </p>
                    </div>
                    <Link
                      href="/counsel?type=career"
                      className="service-action-button mt-6 flex min-h-11 w-full max-w-60 cursor-pointer items-center justify-center rounded-3xl bg-white px-5 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:mt-8"
                    >
                      상담 신청하러 가기
                    </Link>
                  </article>

                  <article
                    className={`flex min-h-[320px] w-full flex-col items-center rounded-3xl bg-green-200/70 px-6 py-8 text-center transition-all delay-[300ms] duration-700 ease-out motion-reduce:transform-none sm:min-h-[340px] sm:p-8 lg:min-h-[360px] lg:px-6 xl:p-10 ${
                      isServicesStage ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                    }`}
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white sm:h-20 sm:w-20 sm:rounded-3xl">
                      <PiTextAlignLeftFill
                        aria-hidden="true"
                        className="h-10 w-10 text-green-600 sm:h-13 sm:w-13"
                      />
                    </div>
                    <div className="mt-6 flex flex-1 flex-col items-center sm:mt-8">
                      <h3 className="text-xl font-bold sm:text-2xl">일반 상담 신청</h3>
                      <p className="mt-3 max-w-sm break-keep text-sm font-light leading-6 text-gray-600">
                        학업, 교우 관계, 학교생활 등 다양한 고민에 대해 상담을 제공받을 수
                        있습니다.
                      </p>
                    </div>
                    <Link
                      href="/counsel?type=general"
                      className="service-action-button mt-6 flex min-h-11 w-full max-w-60 cursor-pointer items-center justify-center rounded-3xl bg-white px-5 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:mt-8"
                    >
                      상담 신청하러 가기
                    </Link>
                  </article>

                  <article
                    className={`flex min-h-[320px] w-full flex-col items-center rounded-3xl bg-green-200/70 px-6 py-8 text-center transition-all delay-[450ms] duration-700 ease-out motion-reduce:transform-none sm:min-h-[340px] sm:p-8 md:col-span-2 md:w-[calc(50%-0.75rem)] md:justify-self-center lg:col-span-1 lg:min-h-[360px] lg:w-full lg:px-6 xl:p-10 ${
                      isServicesStage ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                    }`}
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white sm:h-20 sm:w-20 sm:rounded-3xl">
                      <FaBriefcase
                        aria-hidden="true"
                        className="h-8 w-8 text-green-600 sm:h-10 sm:w-10"
                      />
                    </div>
                    <div className="mt-6 flex flex-1 flex-col items-center sm:mt-8">
                      <h3 className="text-xl font-bold sm:text-2xl">GSM 취업</h3>
                    </div>
                    <Link
                      href="/recruit"
                      className="service-action-button mt-6 flex min-h-11 w-full max-w-60 cursor-pointer items-center justify-center rounded-3xl bg-white px-5 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:mt-8"
                    >
                      취업 공고 보러 가기
                    </Link>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
