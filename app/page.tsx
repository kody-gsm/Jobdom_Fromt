'use client'

import { useEffect, useRef, useState } from "react"
import { IoMdChatbubbles } from "react-icons/io";
import { PiTextAlignLeftFill } from "react-icons/pi";
import { FaCalendar } from "react-icons/fa";

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
    <div className="flex flex-col flex-1 items-center p-25 box-border bg-white font-sans">
      <div className="w-full h-145 bg-white flex flex-col items-center justify-center border-b border-zinc-400">
        <div ref={heroTextRef} className="flex flex-col items-center justify-center gap-6">
          <p
            className={`font-black text-5xl text-center tracking-tighter transition-all duration-1000 ease-out ${
              isHeroVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
          >
            진로 상담, 일반 상담 등<br/>학생, 취업진로부 선생님 통합 플랫폼
          </p>
          <p
            className={`font-thin text-lg text-center mb-10 text-gray-400 leading-5.5 transition-all duration-1000 ease-out delay-200 ${
              isHeroVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
          >
            진로 상담과 일반 상담을 통해 학생들의 학교생활과 진로 고민을 돕습니다.<br/>
          학생들이 자신의 진로를 차분히 준비할 수 있도록 함께합니다.</p>
        </div>
      </div>
      
      <div className="w-full h-155 flex flex-col items-center justify-center gap-20">
        <p className="font-bold text-4xl text-center">잡담에서 지원하는 서비스</p>
        <div className="w-full h-[60%] flex justify-center items-center py-4 box-border gap-10">

          <div className="w-1/3 h-full rounded-4xl flex flex-col justify-center items-center p-10 box-border bg-green-200/70 gap-8">
            <div className="w-20 h-20 flex justify-center items-center p-3 box-border rounded-3xl bg-white">
              <IoMdChatbubbles
              className="text-green-600 w-11 h-11 fill-gree-600"
              strokeWidth={5}/>
            </div>
            <div className="flex flex-col justify-center items-center gap-3">
              <p className="text-2xl font-bold">진로 상담 신청</p>
              <p className="text-xs font-light text-center text-gray-600">
              진로 탐색 및 진학 취업과 관련된 상담을 통해<br/>
              개인의 적성과 목표에 맞는 방향을 설정할 수 있습니다.</p>
            </div>
            <button
              className="w-2/3 h-8 bg-white p-5 rounded-3xl flex justify-center items-center text-sm font-normal
              transition duration-200 ease-out cursor-pointer
              hover:shadow-lg hover:ring-1 hover:ring-green-600 hover:-translate-y-0.5"
            >
              상담 신청하러 가기
            </button>
          </div>

          <div className="w-1/3 h-full rounded-4xl flex flex-col justify-center items-center p-10 box-border bg-green-200/70 gap-8">
            <div className="w-20 h-20 flex justify-center items-center p-3 box-border rounded-3xl bg-white">
              <PiTextAlignLeftFill className="text-green-600 w-13 h-13"/>
            </div>
            <div className="flex flex-col justify-center items-center gap-3">
              <p className="text-2xl font-bold">일반 상담 신청</p>
              <p className="text-xs font-light text-center text-gray-600">
              학업, 교우 관계, 학교생활 등 다양한 고민에 대해<br />
              상담을 제공받을 수 있습니다.</p>
            </div>
            <button
              className="w-2/3 h-8 bg-white p-5 rounded-3xl flex justify-center items-center text-sm font-normal
              transition duration-200 ease-out cursor-pointer
              hover:shadow-lg hover:ring-1 hover:ring-green-600 hover:-translate-y-0.5"
            >
              상담 신청하러 가기
            </button>
          </div>

          <div className="w-1/3 h-full rounded-4xl flex flex-col justify-center items-center p-10 box-border bg-green-200/70 gap-8">
            <div className="w-20 h-20 flex justify-center items-center p-3 box-border rounded-3xl bg-white">
              <FaCalendar className="text-green-600 w-10 h-10"/>
            </div>
            <div className="flex flex-col justify-center items-center gap-3">
              <p className="text-2xl font-bold">면접실 예약</p>
              <p className="text-xs font-light text-center text-gray-600">
              면접 준비 및 연습을 위한 공간을 사전 예약하여<br />
              쾌적한 환경에서 효율적으로 이용할 수 있습니다.</p>
            </div>
            <button
              className="w-2/3 h-8 bg-white p-5 rounded-3xl flex justify-center items-center text-sm font-normal
              transition duration-200 ease-out cursor-pointer
              hover:shadow-lg hover:ring-1 hover:ring-green-600 hover:-translate-y-0.5"
            >
              예약 신청하러 가기
            </button>
          </div>


        </div>
      </div>
    </div>
  );
}
