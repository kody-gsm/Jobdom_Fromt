import Link from "next/link";
import { FaBriefcase } from "react-icons/fa";
import { IoMdChatbubbles } from "react-icons/io";
import { PiTextAlignLeftFill } from "react-icons/pi";
import type { ReactNode } from "react";

type Service = {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  icon: ReactNode;
};

const SERVICES: Service[] = [
  {
    title: "진로 상담 신청",
    description: "진로 탐색과 진학·취업 상담을 통해 적성과 목표에 맞는 방향을 함께 정합니다.",
    href: "/counsel?type=career",
    actionLabel: "상담 신청하러 가기",
    icon: <IoMdChatbubbles aria-hidden="true" className="h-10 w-10 text-green-600" />,
  },
  {
    title: "일반 상담 신청",
    description: "학업, 교우 관계, 학교생활 등 학교에서 마주하는 다양한 고민을 상담합니다.",
    href: "/counsel?type=general",
    actionLabel: "상담 신청하러 가기",
    icon: <PiTextAlignLeftFill aria-hidden="true" className="h-10 w-10 text-green-600" />,
  },
  {
    title: "GSM 취업",
    description: "학교에 등록된 취업 공고와 지원 정보를 한곳에서 확인합니다.",
    href: "/recruit",
    actionLabel: "취업 공고 보러 가기",
    icon: <FaBriefcase aria-hidden="true" className="h-9 w-9 text-green-600" />,
  },
];

export const HomeServices = ({ visible }: { visible: boolean }) => (
  <section
    aria-labelledby="services-title"
    aria-hidden={!visible}
    className={`absolute inset-0 overflow-y-auto py-8 transition-opacity duration-500 sm:py-10 ${
      visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
    }`}
  >
    <div className="flex min-h-full items-start justify-center lg:items-center">
      <div className="w-full">
        <p className="text-center text-sm font-bold text-[#02a946]">JOBDAM SERVICES</p>
        <h2
          id="services-title"
          className="mt-2 break-keep text-center text-3xl font-bold tracking-tight sm:text-4xl"
        >
          잡담에서 필요한 학교생활 서비스를 바로 이용하세요
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <article
              key={service.href}
              className="flex min-h-72 flex-col rounded-3xl border border-green-100 bg-green-50/80 p-7 shadow-sm"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                {service.icon}
              </div>
              <h3 className="mt-6 text-xl font-bold">{service.title}</h3>
              <p className="mt-3 flex-1 break-keep text-sm leading-6 text-gray-600">
                {service.description}
              </p>
              <Link
                href={service.href}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#17201a] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                {service.actionLabel}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);
