"use client";

import Link from "next/link";
import type { Recruit } from "@fsd/entities/recruit";
import { ContentCard } from "@fsd/shared/ui";
import { StudentHeader } from "@fsd/widgets/student-header";
import { useRecruitList } from "../model/useRecruitList.ts";

export const RecruitPage = () => {
  const { items, loading, error } = useRecruitList();

  return (
    <div className="min-h-dvh bg-[#F4F6F8] text-[#13233A]" style={{ fontFamily: '"Pretendard Variable", sans-serif' }}>
      <StudentHeader />
      <main className="mx-auto w-full max-w-[1180px] px-6 py-10 lg:px-10 lg:py-12">
        <section className="rounded-[28px] bg-[#10243E] px-7 py-9 text-white sm:px-10 lg:px-12">
          <p className="text-sm font-bold tracking-[0.16em] text-[#8FB3D9]">RECRUIT</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">학생 취업 공고</h1>
              <p className="mt-4 max-w-2xl break-keep text-sm leading-7 text-[#C8D4E2] sm:text-base">
                학교에 등록된 공개 채용 공고와 지원 일정을 확인하고 필요한 공고를 바로 살펴보세요.
              </p>
            </div>
            <Link href="/forms" className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-[#10243E]">
              신청 폼 보기
            </Link>
          </div>
        </section>

        {error ? (
          <div role="alert" className="mt-6 rounded-2xl border border-[#F0D7D2] bg-[#FFF7F5] p-5 text-sm text-[#9A4F45]">
            {error}
            {error.includes("로그인") ? (
              <Link href="/login" className="ml-2 font-bold underline">로그인</Link>
            ) : null}
          </div>
        ) : null}

        <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {loading ? (
            <EmptyState text="취업 공고를 불러오는 중…" />
          ) : !Array.isArray(items) || items.length === 0 ? (
            <EmptyState text="현재 공개된 취업 공고가 없습니다." />
          ) : (
            items.map((item) => <RecruitCard key={item.id} item={item} />)
          )}
        </section>
      </main>
    </div>
  );
};

const RecruitCard = ({ item }: { item: Recruit }) => (
  <ContentCard className="flex min-h-[330px] flex-col p-7">
    <div className="flex items-start justify-between gap-4">
      <span className="rounded-full bg-[#EEF3F8] px-3 py-1 text-xs font-bold tracking-[0.08em] text-[#315B83]">공개 공고</span>
      <span className="text-xs font-semibold text-[#8A95A3]">{item.deadline || "마감 별도 확인"}</span>
    </div>
    <h2 className="mt-6 break-keep text-2xl font-bold tracking-[-0.02em] text-[#13233A]">
      {item.companyName || "회사명 확인 중"}
    </h2>
    <p className="mt-3 line-clamp-4 flex-1 whitespace-pre-line break-keep text-sm leading-7 text-[#667281]">
      {item.summary || "공고 요약이 없습니다."}
    </p>
    <dl className="mt-6 space-y-2 border-t border-[#E8EBEF] pt-5 text-sm">
      <div className="flex justify-between gap-3">
        <dt className="text-[#8A95A3]">지원 마감</dt>
        <dd className="font-semibold text-[#4E5B6B]">{item.deadline || "별도 확인"}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-[#8A95A3]">면접 일정</dt>
        <dd className="font-semibold text-[#4E5B6B]">{item.interviewDate || "별도 확인"}</dd>
      </div>
    </dl>
    <Link href={`/recruit/${item.id}`} className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#10243E] px-5 text-sm font-bold text-white hover:bg-[#1B3555]">
      공고 상세 보기
    </Link>
  </ContentCard>
);

const EmptyState = ({ text }: { text: string }) => (
  <ContentCard className="col-span-full px-6 py-20 text-center text-[#8A95A3]">
    {text}
  </ContentCard>
);
