"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaBriefcase } from "react-icons/fa";
import { IoMdChatbubbles } from "react-icons/io";
import {
  isConsultationCancelable,
  isConsultationUpcoming,
} from "@fsd/entities/consultation";
import { ContentCard, SummaryActionCard } from "@fsd/shared/ui";
import type { HomeConsultationItem } from "../model/overview.ts";
import { useHomeOverview } from "../model/useHomeOverview.ts";

export const HomeServices = () => {
  const { overview, loading, error, handleCancel } = useHomeOverview();
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [now, setNow] = useState(() => new Date());
  const upcomingConsultations = overview.upcomingConsultations.filter((item) =>
    isConsultationUpcoming(item.date, item.period, now),
  );
  const consultationPreview = upcomingConsultations.slice(0, 2);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const cancelConsultation = async (item: HomeConsultationItem) => {
    if (!isConsultationCancelable(item.date, item.period, new Date())) return;
    try {
      setCancelError("");
      setCancelingId(item.id);
      await handleCancel(item.id);
    } catch {
      setCancelError("상담 예약을 취소하지 못했습니다.");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <section className="space-y-5" aria-label="학생 대시보드">
      <div className="grid gap-5 lg:grid-cols-2">
        <ContentCard className="flex min-h-[280px] flex-col p-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-accent">
            <IoMdChatbubbles aria-hidden="true" className="h-5 w-5" />
          </div>
          <h1 className="mt-7 text-2xl font-bold tracking-[-0.02em] text-ink">
            상담 신청
          </h1>
          <p className="mt-3 flex-1 break-keep text-sm leading-7 text-[#667281]">
            진로 또는 일반 상담을 신청하고 필요한 상담 유형은 신청 화면에서 선택할 수 있습니다.
          </p>
          <Link
            href="/counsel"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#00B94C]"
          >
            상담 신청
          </Link>
        </ContentCard>

        <ContentCard className="p-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-ink">예정 상담</h2>
            <button
              type="button"
              onClick={() => setIsConsultationModalOpen(true)}
              className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-bold text-brand-accent transition-colors hover:bg-brand-soft"
            >
              전체 보기
            </button>
          </div>

          <div className="mt-6">
            {loading ? (
              <p className="py-8 text-sm text-muted">상담 일정을 불러오는 중입니다.</p>
            ) : consultationPreview.length === 0 ? (
              <div className="rounded-2xl bg-[#F7F8FA] px-5 py-8">
                <p className="font-semibold text-[#4E5B6B]">예정된 상담이 없습니다.</p>
                <Link
                  href="/counsel"
                  className="mt-2 inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-bold text-brand-accent transition-colors hover:bg-brand-soft"
                >
                  상담 신청하기
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {consultationPreview.map((item) => (
                  <SummaryActionCard
                    key={item.id}
                    title={item.type}
                    detail={`${item.date.replaceAll("-", ".")} / ${item.period}`}
                    actionLabel="예약 취소"
                    pendingActionLabel="취소 중"
                    actionDisabled={!isConsultationCancelable(item.date, item.period, now)}
                    actionPending={cancelingId === item.id}
                    onAction={() => void cancelConsultation(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </ContentCard>
      </div>

      <ContentCard className="p-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-accent">
              <FaBriefcase aria-hidden="true" className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-ink">취업 공고</h2>
          </div>
          <Link
            href="/recruit"
            className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-bold text-brand-accent transition-colors hover:bg-brand-soft"
          >
            전체 보기
          </Link>
        </div>

        <div className="mt-6">
          {loading ? (
            <p className="py-8 text-sm text-muted">취업 공고를 불러오는 중입니다.</p>
          ) : overview.recentRecruits.length === 0 ? (
            <p className="rounded-2xl bg-[#F7F8FA] px-5 py-8 text-sm text-[#6B7787]">
              현재 공개된 취업 공고가 없습니다.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {overview.recentRecruits.map((item) => (
                <Link
                  key={item.id}
                  href={`/recruit/${item.id}`}
                  className="block rounded-2xl border border-[#E8EBEF] px-5 py-4 transition-colors hover:bg-[#F7F8FA]"
                >
                  <p className="truncate font-bold text-ink">
                    {item.companyName || "회사명 확인 중"}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-[#7A8592]">
                    {item.summary || "공고 요약이 없습니다."}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[#607089]">
                    {item.deadline || "마감 별도 확인"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </ContentCard>

      {error ? <p role="status" className="text-sm text-[#9A675E]">{error}</p> : null}

      {isConsultationModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upcoming-consultations-title"
        >
          <button
            type="button"
            aria-label="예정 상담 닫기"
            onClick={() => setIsConsultationModalOpen(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 id="upcoming-consultations-title" className="text-xl font-bold text-ink">
                예정 상담
              </h2>
              <button
                type="button"
                onClick={() => setIsConsultationModalOpen(false)}
                className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-[#667281] transition-colors hover:bg-surface"
              >
                닫기
              </button>
            </div>
            {cancelError ? (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {cancelError}
              </p>
            ) : null}
            <div className="mt-5 space-y-3">
              {upcomingConsultations.length === 0 ? (
                <p className="rounded-2xl bg-[#F7F8FA] px-5 py-8 text-sm text-[#6B7787]">
                  예정된 상담이 없습니다.
                </p>
              ) : (
                upcomingConsultations.map((item) => (
                  <SummaryActionCard
                    key={item.id}
                    title={item.type}
                    detail={`${item.date.replaceAll("-", ".")} / ${item.period}`}
                    actionLabel="예약 취소"
                    pendingActionLabel="취소 중"
                    actionDisabled={!isConsultationCancelable(item.date, item.period, now)}
                    actionPending={cancelingId === item.id}
                    onAction={() => void cancelConsultation(item)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
