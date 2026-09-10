"use client";

import Link from "next/link";
import type { Recruit } from "@fsd/entities/recruit";
import { ContentCard } from "@fsd/shared/ui";
import { StudentHeader } from "@fsd/widgets/student-header";
import { useRecruitList } from "../model/useRecruitList.ts";

export const RecruitPage = () => {
  const { items, loading, error } = useRecruitList();

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <StudentHeader />
      <main className="mx-auto w-full max-w-[1180px] px-6 py-10 lg:px-10 lg:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">취업 공고</h1>
          <Link href="/forms" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-brand-accent transition-colors hover:bg-brand-soft">
            신청 폼 보기
          </Link>
        </div>

        {error ? (
          <div role="alert" className="mt-6 rounded-2xl border border-[#F0D7D2] bg-[#FFF7F5] p-5 text-sm text-[#9A4F45]">
            {error}
            {error.includes("로그인") ? (
              <Link href="/login" className="ml-2 font-bold underline">로그인</Link>
            ) : null}
          </div>
        ) : null}

        <section className="mt-6 grid gap-5 md:grid-cols-2" aria-live="polite">
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
  <ContentCard className="flex min-h-[320px] flex-col p-7 sm:p-8">
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-brand-accent">채용 공고</span>
        <span className="hidden text-xs font-semibold text-muted">
          마감 {item.deadline || "별도 확인"}
        </span>
      </div>
      <h2 className="mt-5 break-keep text-2xl font-bold tracking-[-0.02em] text-ink">
        {item.companyName || "회사명 확인 중"}
      </h2>
      <p className="mt-3 line-clamp-3 flex-1 whitespace-pre-line break-keep text-sm leading-7 text-[#667281]">
        {item.summary || "공고 요약이 없습니다."}
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-[#E8EBEF] pt-5 text-sm">
        <div><dt className="text-xs text-muted">지원 마감</dt><dd className="mt-1 font-semibold text-[#4E5B6B]">{item.deadline || "별도 확인"}</dd></div>
        <div><dt className="text-xs text-muted">면접 일정</dt><dd className="mt-1 font-semibold text-[#4E5B6B]">{item.interviewDate || "별도 확인"}</dd></div>
      </dl>
      <Link href={`/recruit/${item.id}`} className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover">
        공고 상세 보기
      </Link>
    </ContentCard>
);

const EmptyState = ({ text }: { text: string }) => (
  <ContentCard className="col-span-full px-6 py-20 text-center text-muted">{text}</ContentCard>
);
