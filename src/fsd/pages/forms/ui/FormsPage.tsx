"use client";

import Link from "next/link";
import { formatDeadlineDate, isDeadlinePassed } from "@fsd/shared/lib";
import { ContentCard } from "@fsd/shared/ui";
import { StudentHeader } from "@fsd/widgets/student-header";
import { useFormsPage } from "../model/useFormsPage.ts";

export const FormsPage = () => {
  const { forms, loading, error, retry } = useFormsPage();

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <StudentHeader />
      <main className="mx-auto w-full max-w-[1180px] px-6 py-10 lg:px-10 lg:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">신청 폼</h1>
          <Link href="/recruit" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-brand-accent transition-colors hover:bg-brand-soft">
            취업 공고 보기
          </Link>
        </div>

        <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {loading ? (
            <Empty text="불러오는 중…" />
          ) : error ? (
            <LoadError message={error} onRetry={() => void retry()} />
          ) : forms.length === 0 ? (
            <Empty text="공개된 폼이 없습니다." />
          ) : (
            forms.map((form) => {
              const isExpired = isDeadlinePassed(form.deadline);

              return (
                <ContentCard key={form.id} className="flex min-h-[330px] min-w-0 flex-col p-7">
                  <div className="flex items-start justify-between gap-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${isExpired ? "bg-[#FFF0EC] text-[#9A4F45]" : "bg-[#EAF9F0] text-brand-hover"}`}>
                      {isExpired ? "마감된 폼" : "신청 폼"}
                    </span>
                    <span className="text-xs font-semibold text-muted">질문 {form.questionCount}개</span>
                  </div>
                  <h2 className="mt-6 wrap-anywhere break-keep text-2xl font-bold tracking-[-0.02em] text-ink">{form.title}</h2>
                  <p className="mt-3 line-clamp-4 flex-1 wrap-anywhere whitespace-pre-line break-keep text-sm leading-7 text-[#667281]">
                    {form.description || "폼 설명이 없습니다."}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#E8EBEF] pt-4 text-sm">
                    <span className="shrink-0 text-muted">제한 기한</span>
                    <strong className="min-w-0 wrap-anywhere text-right text-[#4E5B6B]">{formatDeadlineDate(form.deadline)}</strong>
                  </div>
                  {isExpired ? (
                    <button type="button" disabled className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#E3E6EA] px-5 text-sm font-bold text-[#7A8592]">
                      제출 마감
                    </button>
                  ) : (
                    <Link href={`/forms/${form.id}`} className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover">
                      응답하기
                    </Link>
                  )}
                </ContentCard>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
};

const Empty = ({ text }: { text: string }) => (
  <ContentCard className="col-span-full px-6 py-20 text-center text-muted">{text}</ContentCard>
);

const LoadError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <ContentCard className="col-span-full border border-[#F0D7D2] bg-[#FFF7F5] px-6 py-10 text-center">
    <p role="alert" className="text-sm text-[#9A4F45]">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-white px-4 text-sm font-bold text-[#9A4F45] ring-1 ring-[#E7C6C0] hover:bg-[#FFF0EC]"
    >
      다시 시도
    </button>
  </ContentCard>
);
