"use client";

import Link from "next/link";
import { CopyRecruitLinkButton } from "@fsd/features/copy-recruit-link";
import { ContentCard } from "@fsd/shared/ui";
import { StudentHeader } from "@fsd/widgets/student-header";
import { useRecruitDetail } from "../model/useRecruitDetail.ts";

export const RecruitDetailPage = ({ recruitId }: { recruitId: number }) => {
  const { item, error } = useRecruitDetail(recruitId);

  return (
    <div className="min-h-dvh bg-[#F4F6F8] text-[#13233A]" style={{ fontFamily: '"Pretendard Variable", sans-serif' }}>
      <StudentHeader />
      <main className="mx-auto w-full max-w-[980px] px-6 py-10 lg:px-10 lg:py-12">
        <Link href="/recruit" className="text-sm font-bold text-[#607089] hover:text-[#13233A]">
          ← 공고 목록
        </Link>

        <section className="mt-5 rounded-[28px] bg-[#10243E] px-7 py-9 text-white sm:px-10 lg:px-12">
          <p className="text-sm font-bold tracking-[0.16em] text-[#8FB3D9]">공고 상세</p>
          <h1 className="mt-3 break-keep text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            {item?.companyName || "취업 공고"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#C8D4E2]">
            지원 일정과 공고 내용을 확인한 뒤 필요한 신청 폼으로 이동할 수 있습니다.
          </p>
        </section>

        {error ? (
          <p role="alert" className="mt-6 rounded-2xl border border-[#F0D7D2] bg-[#FFF7F5] p-5 text-[#9A4F45]">
            {error}
          </p>
        ) : !item ? (
          <ContentCard className="mt-6 py-20 text-center text-[#8A95A3]">공고를 불러오는 중…</ContentCard>
        ) : (
          <ContentCard className="mt-6 p-7 sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex rounded-full bg-[#EEF3F8] px-3 py-1 text-xs font-bold text-[#315B83]">공개 공고</span>
              <span className="text-xs font-semibold text-[#8A95A3]">JOBDAM RECRUIT</span>
            </div>

            <dl className="mt-7 grid gap-4 rounded-2xl bg-[#F7F8FA] p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-[#8A95A3]">지원 마감</dt>
                <dd className="mt-2 font-bold text-[#13233A]">{item.deadline || "별도 확인"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#8A95A3]">면접 일정</dt>
                <dd className="mt-2 font-bold text-[#13233A]">{item.interviewDate || "별도 확인"}</dd>
              </div>
            </dl>

            <section className="mt-8">
              <h2 className="text-lg font-bold text-[#13233A]">공고 내용</h2>
              <p className="mt-3 whitespace-pre-line break-keep leading-8 text-[#667281]">
                {item.summary || "공고 요약이 없습니다."}
              </p>
            </section>

            <div className="mt-10 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Link href="/forms" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#10243E] px-6 font-bold text-white hover:bg-[#1B3555]">
                신청 폼 보기
              </Link>
              <CopyRecruitLinkButton recruitId={recruitId} />
            </div>
          </ContentCard>
        )}
      </main>
    </div>
  );
};
