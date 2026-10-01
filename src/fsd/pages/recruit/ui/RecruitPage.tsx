"use client";

import Link from "next/link";
import type { Recruit } from "@fsd/entities/recruit";
import { formatRecruitFields, RECRUIT_FIELD_OPTIONS } from "@fsd/entities/recruit";
import { formatDeadlineDate } from "@fsd/shared/lib";
import { ContentCard, ListFilterMenu, ListMultiFilterMenu, SummaryMarkdown } from "@fsd/shared/ui";
import { StudentHeader } from "@fsd/widgets/student-header";
import { isRecruitClosed } from "../model/recruitFilters.ts";
import { useRecruitList } from "../model/useRecruitList.ts";

const RECRUIT_FILTER_OPTIONS = [
  { value: "ALL", label: "모든 공고" },
  { value: "OPEN", label: "모집중인 공고" },
  { value: "CLOSED", label: "마감된 공고" },
] as const;
const FIELD_FILTER_OPTIONS = RECRUIT_FIELD_OPTIONS;

export const RecruitPage = () => {
  const {
    items,
    loading,
    error,
    retry,
    filter,
    setFilter,
    fieldFilters,
    setFieldFilters,
    searchQuery,
    setSearchQuery,
    visibleItems,
  } = useRecruitList();

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <StudentHeader />
      <main className="mx-auto w-full max-w-[1180px] px-6 py-10 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">취업 공고</h1>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative min-w-0 sm:w-64">
              <span className="sr-only">공고 검색</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="회사명·직무·내용 검색"
                className="h-11 w-full rounded-xl border border-[#E1E6EB] bg-white px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-brand"
              />
            </label>
            <ListFilterMenu
              value={filter}
              options={RECRUIT_FILTER_OPTIONS}
              onChange={setFilter}
              ariaLabel="공고 필터 열기"
            />
            <ListMultiFilterMenu value={fieldFilters} options={FIELD_FILTER_OPTIONS} onChange={setFieldFilters} ariaLabel="공고 직무 필터 열기" allLabel="모든 직무" />
            <Link href="/forms" className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-bold text-brand-accent transition-colors hover:bg-brand-soft">
              신청 폼 보기
            </Link>
          </div>
        </div>

        {error ? (
          <div role="alert" className="mt-6 rounded-2xl border border-[#F0D7D2] bg-[#FFF7F5] p-5 text-sm text-[#9A4F45]">
            {error}
            <button type="button" onClick={retry} className="ml-4 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 font-bold text-white hover:bg-brand-hover">
              Retry
            </button>
            {error.includes("로그인") ? (
              <Link href="/login" className="ml-2 font-bold underline">로그인</Link>
            ) : null}
          </div>
        ) : null}

        <section className="mt-6 grid gap-5 md:grid-cols-2" aria-live="polite">
          {loading ? (
            <EmptyState text="취업 공고를 불러오는 중…" />
          ) : !error && visibleItems.length === 0 ? (
            <EmptyState text={items.length === 0 ? "현재 공개된 취업 공고가 없습니다." : "조건에 맞는 공고가 없습니다."} />
          ) : (
            visibleItems.map((item) => <RecruitCard key={item.id} item={item} />)
          )}
        </section>
      </main>
    </div>
  );
};

const RecruitCard = ({ item }: { item: Recruit }) => {
  const isExpired = isRecruitClosed(item);
  const deadlineLabel = item.deadline ? formatDeadlineDate(item.deadline) : "별도 확인";

  return (
    <ContentCard className="flex min-h-[320px] min-w-0 flex-col p-7 sm:p-8">
      <div className="flex items-center gap-4">
        <span className={`text-xs font-bold ${isExpired ? "text-[#9A4F45]" : "text-brand-accent"}`}>
          {isExpired ? "마감된 공고" : "채용 공고"}
        </span>
        <span className="hidden text-xs font-semibold text-muted">마감 {deadlineLabel}</span>
      </div>
      <h2 className="mt-5 wrap-anywhere break-keep text-2xl font-bold tracking-[-0.02em] text-ink">
        {item.companyName || "회사명 확인 중"}
      </h2>
      <p className="mt-2 text-xs font-semibold text-brand-accent">직무 · {formatRecruitFields(item.fields)}</p>
      <SummaryMarkdown text={item.summary || "공고 요약이 없습니다."} className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[#667281]" />
      <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-[#E8EBEF] pt-5 text-sm">
        <div className="min-w-0 wrap-anywhere"><dt className="text-xs text-muted">지원 마감</dt><dd className="mt-1 font-semibold text-[#4E5B6B]">{deadlineLabel}</dd></div>
        <div className="min-w-0 wrap-anywhere"><dt className="text-xs text-muted">면접 일정</dt><dd className="mt-1 font-semibold text-[#4E5B6B]">{item.interviewDate || "별도 확인"}</dd></div>
      </dl>
      <Link href={`/recruit/${item.id}`} className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover">
        공고 상세 보기
      </Link>
    </ContentCard>
  );
};

const EmptyState = ({ text }: { text: string }) => (
  <ContentCard className="col-span-full px-6 py-20 text-center text-muted">{text}</ContentCard>
);
