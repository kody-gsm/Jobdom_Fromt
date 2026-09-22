"use client";

import { useEffect, useState } from "react";
import {
  getConsultationCancelError,
  getReservationPresentation,
  isActiveReservation,
  isConsultationCancelable,
  isConsultationUpcoming,
} from "@fsd/entities/consultation";
import { ConsultationCancelDialog } from "@fsd/entities/consultation/ui/ConsultationCancelDialog.tsx";
import type { ProfileConsultation } from "@fsd/entities/consultation";
import { ContentCard, SummaryActionCard } from "@fsd/shared/ui";

interface ProfileConsultationsProps {
  reservations: ProfileConsultation[];
  onCancel: (id: number) => Promise<void>;
}

export const ProfileConsultations = ({ reservations, onCancel }: ProfileConsultationsProps) => {
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [now, setNow] = useState(() => new Date());
  const cancelTargetItem = reservations.find((item) => item.id === cancelTarget);
  const visibleReservations = reservations.filter((item) =>
    isActiveReservation(item.status) && isConsultationUpcoming(item.date, item.slot, now),
  );

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
        <div className="mt-5 space-y-3">
          {visibleReservations.length === 0 ? (
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
                    setCancelTarget(item.id);
                  }}
                />
              );
            })
          )}
        </div>
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
            setCancelTarget(null);
          }}
          onConfirm={() => void executeCancel()}
        />
      ) : null}
    </>
  );
};
