"use client";

import Link from "next/link";
import { CopyRecruitLinkButton } from "@fsd/features/copy-recruit-link";
import { formatDeadlineDate, isDeadlinePassed } from "@fsd/shared/lib";
import { ContentCard, SummaryMarkdown } from "@fsd/shared/ui";
import { StudentHeader } from "@fsd/widgets/student-header";
import { useRecruitDetail } from "../model/useRecruitDetail.ts";

export const RecruitDetailPage = ({ recruitId }: { recruitId: number }) => {
  const {
    item,
    form,
    error,
    formLoading,
    formError,
    formMessage,
    retryForm,
    showMissingForm,
  } = useRecruitDetail(recruitId);
  const isExpired = item ? isDeadlinePassed(item.deadline) : false;
  const deadlineLabel = item?.deadline ? formatDeadlineDate(item.deadline) : "마감 별도 확인";

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <StudentHeader />
      <main className="mx-auto w-full max-w-[980px] px-6 py-10 lg:px-10 lg:py-12">
        <Link href="/recruit" className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-bold text-[#607089] transition-colors hover:bg-[#EEF3F8] hover:text-ink">
          ← 공고 목록
        </Link>
        <h1 className="mt-5 wrap-anywhere break-keep text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
          {item?.companyName || "취업 공고"}
        </h1>

        {error ? (
          <p role="alert" className="mt-6 rounded-2xl border border-[#F0D7D2] bg-[#FFF7F5] p-5 text-[#9A4F45]">
            {error}
          </p>
        ) : !item ? (
          <ContentCard className="mt-6 py-20 text-center text-muted">공고를 불러오는 중…</ContentCard>
        ) : (
          <ContentCard className="mt-6 min-w-0 p-7 sm:p-10">
            {item.imageUrl ? <img src={resolveRecruitImageUrl(item.imageUrl)} alt={`${item.companyName || "취업 공고"} 공고 이미지`} className="mb-8 max-h-[620px] w-full rounded-2xl object-contain" /> : null}
            <div className="flex items-center justify-between gap-3">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${isExpired ? "bg-[#FFF0EC] text-[#9A4F45]" : "bg-[#EEF3F8] text-[#315B83]"}`}>
                {isExpired ? "마감된 공고" : "공개 공고"}
              </span>
              <span className="min-w-0 wrap-anywhere text-right text-xs font-semibold text-muted">{deadlineLabel}</span>
            </div>

            <dl className="mt-7 grid gap-4 rounded-2xl bg-[#F7F8FA] p-5 sm:grid-cols-2">
              <div className="min-w-0 wrap-anywhere">
                <dt className="text-xs font-semibold text-muted">지원 마감</dt>
                <dd className="mt-2 font-bold text-ink">{deadlineLabel}</dd>
              </div>
              <div className="min-w-0 wrap-anywhere">
                <dt className="text-xs font-semibold text-muted">면접 일정</dt>
                <dd className="mt-2 font-bold text-ink">{item.interviewDate || "별도 확인"}</dd>
              </div>
            </dl>

            <section className="mt-8">
              <h2 className="text-lg font-bold text-ink">공고 내용</h2>
              <SummaryMarkdown text={item.summary || "공고 요약이 없습니다."} className="mt-3 leading-8 text-[#667281]" />
            </section>

            {formError ? (
              <div role="alert" className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <p>{formError}</p>
                <button type="button" onClick={retryForm} className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-brand px-4 font-bold text-white hover:bg-brand-hover">
                  Retry
                </button>
              </div>
            ) : null}
            <div className="mt-10 grid gap-3 sm:grid-cols-[1fr_auto]">
              {isExpired ? (
                <button type="button" disabled className="inline-flex h-12 items-center justify-center rounded-xl bg-[#E3E6EA] px-6 font-bold text-[#7A8592]">
                  마감된 공고
                </button>
              ) : formLoading ? (
                <button type="button" disabled className="inline-flex h-12 items-center justify-center rounded-xl bg-[#E3E6EA] px-6 font-bold text-[#7A8592]">
                  신청서 확인 중
                </button>
              ) : formError ? (
                <button type="button" disabled className="inline-flex h-12 items-center justify-center rounded-xl bg-[#E3E6EA] px-6 font-bold text-[#7A8592]">
                  신청서 확인 불가
                </button>
              ) : form ? (
                <Link href={`/forms/${form.id}`} className="inline-flex h-12 items-center justify-center rounded-xl bg-brand px-6 font-bold text-white hover:bg-brand-hover">신청폼 보기</Link>
              ) : (
                <button type="button" onClick={showMissingForm} className="inline-flex h-12 items-center justify-center rounded-xl bg-brand px-6 font-bold text-white hover:bg-brand-hover">신청폼 보기</button>
              )}
              <CopyRecruitLinkButton recruitId={recruitId} />
            </div>
            {isExpired ? <p role="status" className="mt-3 text-sm font-semibold text-[#9A4F45]">제출 기한이 지나 신청할 수 없습니다.</p> : null}
            {formMessage ? <p role="status" className="mt-3 text-sm font-semibold text-[#D93025]">{formMessage}</p> : null}
          </ContentCard>
        )}
      </main>
    </div>
  );
};

const resolveRecruitImageUrl = (imageUrl: string) => {
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  const basePath = (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "");
  return `${basePath}/${imageUrl.replace(/^\/+/, "")}`;
};
