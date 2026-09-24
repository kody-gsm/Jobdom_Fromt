"use client";

import { useEffect, useState } from "react";
import {
  getConsultationCancelError,
  getReservationPresentation,
  isActiveReservation,
  isConsultationCancelable,
  isConsultationUpcoming,
} from "@fsd/entities/consultation";
import { ConsultationCancelDialog } from "@fsd/features/cancel-consultation";
import type { ProfileConsultation } from "@fsd/entities/consultation";
import { ContentCard, SummaryActionCard } from "@fsd/shared/ui";

interface ProfileConsultationsProps {
  reservations: ProfileConsultation[];
  onCancel: (id: number) => Promise<void>;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export const ProfileConsultations = ({
  reservations,
  onCancel,
  loading = false,
  error = "",
  onRetry,
}: ProfileConsultationsProps) => {
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [reservationChangedMessage, setReservationChangedMessage] = useState("");
  const [now, setNow] = useState(() => new Date());
  const cancelTargetItem = reservations.find((item) => item.id === cancelTarget);
  const visibleReservations = reservations.filter((item) =>
    isActiveReservation(item.status) && isConsultationUpcoming(item.date, item.slot, now),
  );

  useEffect(() => {
    if (cancelTarget === null || cancelTargetItem) return;
    queueMicrotask(() => {
      setCancelTarget(null);
      setCancelError("");
      setReservationChangedMessage("상담 예약 상태가 변경되어 취소 창을 닫았습니다.");
    });
  }, [cancelTarget, cancelTargetItem]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const executeCancel = async () => {
    if (cancelTarget === null || canceling) return;
    const target = reservations.find((item) => item.id === cancelTarget);
    if (!target || !isConsultationCancelable(target.date, target.slot, new Date())) {
      setCancelError(
        target
          ? getConsultationCancelError(target.date, target.slot, new Date()) ?? "취소할 수 없습니다."
          : "취소할 수 없습니다.",
      );
      return;
    }
    try {
      setCanceling(true);
      setCancelError("");
      await onCancel(cancelTarget);
      setCanceling(false);
      setCancelTarget(null);
    } catch {
      setCanceling(false);
      setCancelError("취소 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <ContentCard className="p-6">
        <h2 className="text-xl font-bold text-ink">예약 현황</h2>
        {reservationChangedMessage ? (
          <div role="status" className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#FFF8E6] px-4 py-3 text-sm text-[#8A5A00]">
            <p>{reservationChangedMessage}</p>
            <button type="button" onClick={() => setReservationChangedMessage("")} className="shrink-0 font-bold underline">
              확인
            </button>
          </div>
        ) : null}
        <div className="mt-5 space-y-3">
          {loading && reservations.length === 0 ? (
            <p className="rounded-2xl bg-[#F7F8FA] px-5 py-8 text-center text-sm text-muted">
              상담 목록을 불러오는 중입니다.
            </p>
          ) : error && reservations.length === 0 ? (
            <div role="alert" className="rounded-2xl border border-[#F0D7D2] bg-[#FFF7F5] px-5 py-6">
              <p className="text-sm text-[#9A4F45]">{error}</p>
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-white px-3 text-sm font-bold text-[#9A4F45] ring-1 ring-[#E7C6C0] hover:bg-[#FFF0EC]"
                >
                  다시 시도
                </button>
              ) : null}
            </div>
          ) : visibleReservations.length === 0 ? (
            <p className="rounded-2xl bg-[#F7F8FA] px-5 py-8 text-center text-sm text-muted">
              예약된 상담이 없습니다.
            </p>
          ) : (
            visibleReservations.map((item) => {
              const presentation = getReservationPresentation(item.status);
              return (
                <SummaryActionCard
                  key={item.id}
                  title={`${item.type} · ${item.teacherName} · ${presentation.statusLabel}`}
                  detail={`${item.date} / ${item.slot}`}
                  actionLabel={presentation.actionLabel}
                  actionDisabled={!isConsultationCancelable(item.date, item.slot, now)}
                  onAction={() => {
                    setCancelError("");
                    setReservationChangedMessage("");
                    setCancelTarget(item.id);
                  }}
                />
              );
            })
          )}
        </div>
        {error && reservations.length > 0 ? (
          <div role="alert" className="mt-3 rounded-2xl border border-[#F0D7D2] bg-[#FFF7F5] px-5 py-4">
            <p className="text-sm text-[#9A4F45]">{error}</p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-white px-3 text-sm font-bold text-[#9A4F45] ring-1 ring-[#E7C6C0] hover:bg-[#FFF0EC]"
              >
                다시 시도
              </button>
            ) : null}
          </div>
        ) : null}
        <p className="mt-5 text-center text-xs text-gray-400">
          * 예약 취소는 1시간 전부터 불가능합니다
        </p>
      </ContentCard>

      {cancelTargetItem ? (
        <ConsultationCancelDialog
          target={{
            type: cancelTargetItem.type,
            teacherName: cancelTargetItem.teacherName,
            date: cancelTargetItem.date,
            period: cancelTargetItem.slot,
            actionLabel: getReservationPresentation(cancelTargetItem.status).actionLabel,
          }}
          pending={canceling}
          error={cancelError}
          confirmDisabled={!isConsultationCancelable(cancelTargetItem.date, cancelTargetItem.slot, now)}
          confirmButtonClassName="bg-brand hover:bg-[#00B94C]"
          onClose={() => {
            setCancelError("");
            setReservationChangedMessage("");
            setCancelTarget(null);
          }}
          onConfirm={() => void executeCancel()}
        />
      ) : null}
    </>
  );
};
