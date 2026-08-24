'use client'

import { useEffect, useRef, useState } from "react"
import { IoMdChatbubbles } from "react-icons/io";
import { PiTextAlignLeftFill } from "react-icons/pi";
import { FaCalendar } from "react-icons/fa";
import { Header } from "./components/organisms";

export default function Home() {
  const heroTextRef = useRef<HTMLDivElement | null>(null);
  const [isHeroVisible, setIsHeroVisible] = useState(false);

  useEffect(() => {
    const heroTextElement = heroTextRef.current;

    if (!heroTextElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHeroVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0,
      }
    );

    observer.observe(heroTextElement);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />
      <main className="flex flex-1 flex-col items-center bg-white px-4 font-sans sm:px-6 lg:px-10">
        <section className="flex min-h-[440px] w-full max-w-7xl items-center justify-center border-b border-zinc-300 py-16 sm:min-h-[500px] sm:py-20 lg:min-h-[580px]">
          <div
            ref={heroTextRef}
            className="flex w-full max-w-5xl flex-col items-center justify-center gap-5 px-1 sm:gap-6 sm:px-4"
          >
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
        </section>

        <section
          aria-labelledby="services-title"
          className="w-full max-w-7xl py-16 sm:py-20 lg:py-24"
        >
          <h2
            id="services-title"
            className="break-keep text-center text-2xl font-bold sm:text-3xl lg:text-4xl"
          >
            잡담에서 지원하는 서비스
          </h2>

          <div className="mt-10 grid w-full grid-cols-1 gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
            <article className="flex min-h-[320px] w-full flex-col items-center rounded-3xl bg-green-200/70 px-6 py-8 text-center sm:min-h-[340px] sm:p-8 lg:min-h-[360px] lg:px-6 xl:p-10">
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
              <button
                type="button"
                className="service-action-button mt-6 flex min-h-11 w-full max-w-60 cursor-pointer items-center justify-center rounded-3xl bg-white px-5 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:mt-8"
              >
                상담 신청하러 가기
              </button>
            </article>

            <article className="flex min-h-[320px] w-full flex-col items-center rounded-3xl bg-green-200/70 px-6 py-8 text-center sm:min-h-[340px] sm:p-8 lg:min-h-[360px] lg:px-6 xl:p-10">
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
              <button
                type="button"
                className="service-action-button mt-6 flex min-h-11 w-full max-w-60 cursor-pointer items-center justify-center rounded-3xl bg-white px-5 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:mt-8"
              >
                상담 신청하러 가기
              </button>
            </article>

            <article className="flex min-h-[320px] w-full flex-col items-center rounded-3xl bg-green-200/70 px-6 py-8 text-center sm:min-h-[340px] sm:p-8 md:col-span-2 md:w-[calc(50%-0.75rem)] md:justify-self-center lg:col-span-1 lg:min-h-[360px] lg:w-full lg:px-6 xl:p-10">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white sm:h-20 sm:w-20 sm:rounded-3xl">
                <FaCalendar
                  aria-hidden="true"
                  className="h-8 w-8 text-green-600 sm:h-10 sm:w-10"
                />
              </div>
              <div className="mt-6 flex flex-1 flex-col items-center sm:mt-8">
                <h3 className="text-xl font-bold sm:text-2xl">면접실 예약</h3>
                <p className="mt-3 max-w-sm break-keep text-sm font-light leading-6 text-gray-600">
                  면접 준비 및 연습을 위한 공간을 사전 예약하여 쾌적한 환경에서
                  효율적으로 이용할 수 있습니다.
                </p>
              </div>
              <button
                type="button"
                className="service-action-button mt-6 flex min-h-11 w-full max-w-60 cursor-pointer items-center justify-center rounded-3xl bg-white px-5 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:mt-8"
              >
                예약 신청하러 가기
              </button>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
