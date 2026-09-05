"use client";

import Link from "next/link";
import { ContentCard } from "@fsd/shared/ui";
import { StudentHeader } from "@fsd/widgets/student-header";
import { useFormsPage } from "../model/useFormsPage.ts";

export const FormsPage = () => {
  const { forms, loading, error } = useFormsPage();

  return (
    <div className="min-h-dvh bg-[#F4F6F8] text-[#13233A]" style={{ fontFamily: '"Pretendard Variable", sans-serif' }}>
      <StudentHeader />
      <main className="mx-auto w-full max-w-[1080px] px-6 py-10 lg:px-10 lg:py-12">
        <section className="rounded-[28px] bg-[#10243E] px-7 py-9 text-white sm:px-10 lg:px-12">
          <p className="text-sm font-bold tracking-[0.16em] text-[#8FB3D9]">APPLICATION FORMS</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">학생 신청 폼</h1>
              <p className="mt-4 max-w-2xl break-keep text-sm leading-7 text-[#C8D4E2] sm:text-base">
                학교에서 공개한 신청 폼을 확인하고 필요한 항목에 바로 응답할 수 있습니다.
              </p>
            </div>
            <Link href="/recruit" className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-[#10243E]">
              취업 공고 보기
            </Link>
          </div>
        </section>

        {error ? (
          <p role="alert" className="mt-6 rounded-2xl border border-[#F0D7D2] bg-[#FFF7F5] p-5 text-sm text-[#9A4F45]">
            {error}
          </p>
        ) : null}

        <section className="mt-6 grid gap-5 sm:grid-cols-2" aria-live="polite">
          {loading ? (
            <Empty text="불러오는 중…" />
          ) : forms.length === 0 ? (
            <Empty text="공개된 폼이 없습니다." />
          ) : (
            forms.map((form) => (
              <ContentCard key={form.id} className="flex min-h-[260px] flex-col p-7">
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-[#EEF3F8] px-3 py-1 text-xs font-bold text-[#315B83]">
                    신청 폼
                  </span>
                  <span className="text-xs font-semibold text-[#8A95A3]">질문 {form.questionCount}개</span>
                </div>
                <h2 className="mt-6 break-keep text-2xl font-bold tracking-[-0.02em] text-[#13233A]">
                  {form.title}
                </h2>
                <p className="mt-3 flex-1 whitespace-pre-line break-keep text-sm leading-7 text-[#667281]">
                  {form.description || "폼 설명이 없습니다."}
                </p>
                <Link
                  href={`/forms/${form.id}`}
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#10243E] px-5 text-sm font-bold text-white hover:bg-[#1B3555]"
                >
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
  <ContentCard className="col-span-full px-6 py-20 text-center text-[#8A95A3]">
    {text}
  </ContentCard>
);
