"use client";

import { useState } from "react";
import { getConsultationTeacherLabel } from "../model/labels.ts";
import { ActionButton } from "@fsd/shared/ui";

export type ConsultationCancelTarget = {
  type: string;
  teacherName: string;
  date: string;
  period: string;
  actionLabel: string;
};

type ConsultationCancelDialogProps = {
  target: ConsultationCancelTarget;
  pending?: boolean;
  error?: string;
  confirmDisabled?: boolean;
  confirmButtonClassName?: string;
  onClose: () => void;
  onConfirm: () => void;
};

export const ConsultationCancelDialog = ({
  target,
  pending = false,
  error = "",
  confirmDisabled = false,
  confirmButtonClassName = "",
  onClose,
  onConfirm,
}: ConsultationCancelDialogProps) => {
  const [confirming, setConfirming] = useState(false);

  const close = () => {
    if (!pending) onClose();
  };

  if (confirming) {
    return (
      <div
        className="fixed inset-0 z-[110] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-consultation-cancel-title"
      >
        <button
          type="button"
          aria-label="취소 확인 모달 닫기"
          onClick={close}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />
        <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
          <h2 id="confirm-consultation-cancel-title" className="text-center text-xl font-bold text-ink">
            {target.actionLabel}
          </h2>
          <p className="mt-4 text-center font-semibold text-gray-800">
            정말 {target.actionLabel}하시겠습니까?
          </p>
          {error ? (
            <p role="alert" className="mt-3 text-center text-sm text-red-600">
              {error}
            </p>
          ) : null}
          {confirmDisabled ? (
            <p role="status" className="mt-3 text-center text-sm text-gray-500">
              상담 시작 1시간 전부터는 취소할 수 없습니다.
            </p>
          ) : null}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <ActionButton type="button" variant="secondary" disabled={pending} onClick={close}>
              아니요
            </ActionButton>
            <ActionButton
              type="button"
              disabled={pending || confirmDisabled}
              onClick={onConfirm}
              className={confirmButtonClassName}
            >
              {pending ? "처리 중…" : "확인"}
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-cancel-title"
    >
      <button
        type="button"
        aria-label="상담 취소 모달 닫기"
        onClick={close}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <h2 id="consultation-cancel-title" className="text-center text-xl font-bold text-ink">
          상담 취소
        </h2>
        <div className="mt-5 rounded-2xl bg-[#F7F8FA] px-5 py-4 text-center">
          <p className="font-bold text-ink">{target.type}</p>
          <p className="mt-1 font-semibold text-[#4E5B6B]">
            {getConsultationTeacherLabel(target.teacherName)}
          </p>
          <p className="mt-2 text-sm text-[#667281]">
            {target.date} / {target.period}
          </p>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-center text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {confirmDisabled ? (
          <p role="status" className="mt-3 text-center text-sm text-gray-500">
            상담 시작 1시간 전부터는 취소할 수 없습니다.
          </p>
        ) : null}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <ActionButton type="button" variant="secondary" onClick={close}>
            닫기
          </ActionButton>
          <ActionButton
            type="button"
            disabled={confirmDisabled}
            onClick={() => setConfirming(true)}
          >
            {target.actionLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
};
