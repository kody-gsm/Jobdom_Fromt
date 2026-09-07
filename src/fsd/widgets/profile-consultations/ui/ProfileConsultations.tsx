"use client";

import { useEffect, useState } from "react";
import {
  isConsultationCancelable,
  isConsultationUpcoming,
} from "@fsd/entities/consultation";
import type { ProfileConsultation } from "@fsd/entities/consultation";
import { ActionButton, ConsultationReservationCard, ContentCard } from "@fsd/shared/ui";

interface ProfileConsultationsProps {
  reservations: ProfileConsultation[];
  onCancel: (id: number) => Promise<void>;
}

export const ProfileConsultations = ({
  reservations,
  onCancel,
}: ProfileConsultationsProps) => {
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState("");
  const [now, setNow] = useState(() => new Date());
  const visibleReservations = reservations.filter((item) =>
    isConsultationUpcoming(item.date, item.slot, now),
  );

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const executeCancel = async () => {
    if (cancelTarget === null) return;
    const target = reservations.find((item) => item.id === cancelTarget);
    if (!target || !isConsultationCancelable(target.date, target.slot, new Date())) {
      setCancelError("상담 시작 1시간 전부터는 취소할 수 없습니다.");
      return;
    }
    try {
      setCancelError("");
      await onCancel(cancelTarget);
      setCancelTarget(null);
    } catch {
      setCancelError("취소 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <ContentCard className="p-6">
        <h2 className="text-xl font-bold text-ink">예약 현황</h2>
        <div className="mt-5 space-y-3">
          {visibleReservations.length === 0 ? (
            <p className="rounded-2xl bg-[#F7F8FA] px-5 py-8 text-center text-sm text-muted">
              예약된 상담이 없습니다.
            </p>
          ) : (
            visibleReservations.map((item) => (
              <ConsultationReservationCard
                key={item.id}
                type={item.type}
                date={item.date}
                period={item.slot}
                canCancel={isConsultationCancelable(item.date, item.slot, now)}
                onCancel={() => setCancelTarget(item.id)}
              />
            ))
          )}
        </div>
        <p className="mt-5 text-center text-xs text-gray-400">
          * 예약취소는 1시간 전부터 불가능합니다
        </p>
      </ContentCard>

      {cancelTarget !== null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-reservation-title"
        >
          <button
            type="button"
            aria-label="예약 취소 닫기"
            onClick={() => setCancelTarget(null)}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h2 id="cancel-reservation-title" className="text-center text-xl font-bold text-ink">
              예약 취소
            </h2>
            <p className="mt-4 text-center font-semibold text-gray-800">
              정말 예약을 취소하시는 건가요?
            </p>
            {cancelError ? (
              <p role="alert" className="mt-3 text-center text-sm text-red-600">
                {cancelError}
              </p>
            ) : null}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <ActionButton
                type="button"
                variant="secondary"
                onClick={() => setCancelTarget(null)}
              >
                아니요
              </ActionButton>
              <ActionButton
                type="button"
                onClick={() => void executeCancel()}
                className="bg-brand hover:bg-[#00B94C]"
              >
                예
              </ActionButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};