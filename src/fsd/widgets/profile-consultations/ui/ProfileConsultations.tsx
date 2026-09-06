"use client";

import { useState } from "react";
import type { ProfileConsultation } from "@fsd/entities/consultation";
import { ActionButton, ContentCard } from "@fsd/shared/ui";

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

  const executeCancel = async () => {
    if (cancelTarget === null) return;
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
        <h2 className="text-xl font-bold text-[#13233A]">예약 현황</h2>
        <div className="mt-5 space-y-3">
          {reservations.length === 0 ? (
            <p className="rounded-2xl bg-[#F7F8FA] px-5 py-8 text-center text-sm text-[#8A95A3]">
              예약된 상담이 없습니다.
            </p>
          ) : (
            reservations.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl bg-[#F7F8FA] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-[#13233A]">{item.type}</p>
                  <p className="mt-1 text-sm text-[#7A8592]">
                    {item.date} / {item.slot}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCancelTarget(item.id)}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  예약 취소
                </button>
              </div>
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
            <h2 id="cancel-reservation-title" className="text-center text-xl font-bold text-[#13233A]">
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
                className="bg-[#02C551] hover:bg-[#00B94C]"
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