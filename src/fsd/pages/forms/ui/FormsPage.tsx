"use client";

import Link from "next/link";
import { ContentCard } from "@fsd/shared/ui";
import { StudentHeader } from "@fsd/widgets/student-header";
import { useFormsPage } from "../model/useFormsPage.ts";

export const FormsPage = () => {
  const { forms, loading, error } = useFormsPage();

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

        {error ? (
          <p role="alert" className="mt-6 rounded-2xl border border-[#F0D7D2] bg-[#FFF7F5] p-5 text-sm text-[#9A4F45]">
            {error}
          </p>
        ) : null}

        <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {loading ? (
            <Empty text="불러오는 중…" />
          ) : forms.length === 0 ? (
            <Empty text="공개된 폼이 없습니다." />
          ) : (
            forms.map((form) => (
              <ContentCard key={form.id} className="flex min-h-[330px] flex-col p-7">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-[#EAF9F0] px-3 py-1 text-xs font-bold text-brand-hover">
                    신청 폼
                  </span>
                  <span className="text-xs font-semibold text-muted">질문 {form.questionCount}개</span>
                </div>
                <h2 className="mt-6 break-keep text-2xl font-bold tracking-[-0.02em] text-ink">{form.title}</h2>
                <p className="mt-3 line-clamp-4 flex-1 whitespace-pre-line break-keep text-sm leading-7 text-[#667281]">
                  {form.description || "폼 설명이 없습니다."}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#E8EBEF] pt-4 text-sm">
                  <span className="text-muted">제한 기한</span>
                  <strong className="text-right text-[#4E5B6B]">{formatFormDeadline(form.deadline)}</strong>
                </div>
                <Link href={`/forms/${form.id}`} className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-white hover:bg-brand-hover">
                  응답하기
                </Link>
              </ContentCard>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

const Empty = ({ text }: { text: string }) => (
  <ContentCard className="col-span-full px-6 py-20 text-center text-muted">{text}</ContentCard>
);

const formatFormDeadline = (deadline: string | null) => {
  if (!deadline) return "제한 없음";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return deadline;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};