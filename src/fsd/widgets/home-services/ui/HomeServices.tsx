import Link from "next/link";
import { FaBriefcase } from "react-icons/fa";
import { IoMdChatbubbles } from "react-icons/io";
import { PiTextAlignLeftFill } from "react-icons/pi";
import type { ReactNode } from "react";
import { ContentCard } from "@fsd/shared/ui";

type Service = {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  icon: ReactNode;
  eyebrow: string;
};

const SERVICES: Service[] = [
  {
    title: "진로 상담 신청",
    description: "진로 탐색과 진학·취업 고민을 선생님과 함께 정리하고 다음 방향을 계획합니다.",
    href: "/counsel?type=career",
    actionLabel: "진로 상담 신청",
    eyebrow: "CAREER",
    icon: <IoMdChatbubbles aria-hidden="true" className="h-7 w-7" />,
  },
  {
    title: "일반 상담 신청",
    description: "학업, 교우 관계, 학교생활 등 지금 필요한 이야기를 부담 없이 상담할 수 있습니다.",
    href: "/counsel?type=general",
    actionLabel: "일반 상담 신청",
    eyebrow: "LIFE",
    icon: <PiTextAlignLeftFill aria-hidden="true" className="h-7 w-7" />,
  },
  {
    title: "GSM 취업",
    description: "학교에 등록된 채용 공고와 지원 정보를 확인하고 취업 준비 흐름을 이어갑니다.",
    href: "/recruit",
    actionLabel: "취업 공고 보기",
    eyebrow: "RECRUIT",
    icon: <FaBriefcase aria-hidden="true" className="h-6 w-6" />,
  },
];

export const HomeServices = ({ visible }: { visible: boolean }) => (
  <section
    aria-labelledby="services-title"
    aria-hidden={!visible}
    className={`absolute inset-0 overflow-y-auto transition-all duration-500 ${
      visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
    }`}
  >
    <div className="min-h-full rounded-[32px] bg-[#F4F6F8] px-1 py-2 sm:px-2">
      <div className="mx-auto flex min-h-full max-w-[1280px] flex-col justify-center py-8 lg:py-12">
        <div className="flex flex-col gap-4 border-b border-[#DDE3E8] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold tracking-[0.16em] text-[#607089]">빠른 메뉴</p>
            <h2 id="services-title" className="mt-3 break-keep text-3xl font-bold tracking-[-0.035em] text-[#13233A] sm:text-4xl">
              오늘 필요한 학교생활 서비스를 바로 시작하세요.
            </h2>
          </div>
          <p className="max-w-md break-keep text-sm leading-6 text-[#6B7787]">
            상담 신청부터 취업 공고 확인까지 학생이 자주 사용하는 기능만 모았습니다.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <ContentCard key={service.href} className="group flex min-h-[310px] flex-col p-7 transition-transform duration-200 hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10243E] text-white">
                  {service.icon}
                </div>
                <span className="text-xs font-bold tracking-[0.14em] text-[#8A95A3]">{service.eyebrow}</span>
              </div>
              <h3 className="mt-8 text-2xl font-bold tracking-[-0.02em] text-[#13233A]">{service.title}</h3>
              <p className="mt-3 flex-1 break-keep text-sm leading-7 text-[#667281]">{service.description}</p>
              <Link
                href={service.href}
                className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#10243E] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1B3555] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10243E]"
              >
                {service.actionLabel}
              </Link>
            </ContentCard>
          ))}
        </div>
      </div>
    </div>
  </section>
);
