"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  TEACHERS,
  createReservationInput,
  getAvailablePeriods,
  getNextWeekdays,
  toConsultationKind,
  validateConsultationDraft,
} from "@fsd/entities/consultation";
import type {
  ConsultationTeacher,
  ConsultationType,
} from "@fsd/entities/consultation";
import { ApiError } from "@fsd/shared/api";
import { ActionButton, ContentCard, SegmentedTabs, TextAreaField, TextField } from "@fsd/shared/ui";
import {
  getUpcomingConsultations,
  submitConsultation,
} from "../api/consultation.ts";

type Toast = { message: string; type: "error" | "success" };

export const ConsultationForm = ({
  initialType,
}: {
  initialType: ConsultationType;
}) => {
  const router = useRouter();
  const [counselType, setCounselType] = useState(initialType);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<ConsultationTeacher | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [hasCareerReservation, setHasCareerReservation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | null>(null);
  const dates = useMemo(() => getNextWeekdays(), []);
  const times = getAvailablePeriods(counselType, selectedTeacher);

  useEffect(() => {
    let active = true;
    void getUpcomingConsultations("course")
      .then((items) => {
        if (active) setHasCareerReservation(items.length > 0);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string, type: Toast["type"] = "error") => {
    setToast({ message, type });
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  };

  const handleTabChange = (type: ConsultationType) => {
    setCounselType(type);
    setSelectedTeacher(null);
    setSelectedTime(null);
  };
  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedTeacher(null);
    setSelectedDate(null);
    setSelectedTime(null);
    router.push("/");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const draft = {
      type: counselType,
      title,
      content,
      teacher: selectedTeacher,
      date: selectedDate,
      period: selectedTime,
    };
    const validationMessage = validateConsultationDraft(
      draft,
      hasCareerReservation,
    );
    if (validationMessage) {
      showToast(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      await submitConsultation(
        toConsultationKind(counselType),
        createReservationInput(draft),
      );
      if (counselType === "career") setHasCareerReservation(true);
      showToast("상담 신청이 완료되었습니다", "success");
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "상담 신청에 실패했습니다",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {toast ? (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`fixed right-6 top-6 z-[60] rounded-2xl px-5 py-4 text-sm font-semibold text-white shadow-lg ${
            toast.type === "success" ? "bg-[#02C551]" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <ContentCard className="p-6 sm:p-8">
        <p className="text-xs font-bold tracking-[0.14em] text-[#8A95A3]">STEP 01</p>
        <h2 className="mt-2 text-xl font-bold text-[#13233A]">상담 유형을 선택해주세요</h2>
        <SegmentedTabs
          ariaLabel="상담 유형"
          className="mt-5"
          items={[
            { value: "career", label: "진로 상담" },
            { value: "general", label: "일반 상담" },
          ]}
          value={counselType}
          onChange={handleTabChange}
        />
      </ContentCard>

      <ContentCard className="space-y-5 p-6 sm:p-8">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-[#8A95A3]">STEP 02</p>
          <h2 className="mt-2 text-xl font-bold text-[#13233A]">상담 내용을 작성해주세요</h2>
        </div>
        <TextField
          label="상담 제목"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="상담 제목을 입력해주세요"
        />
        <div>
          <TextAreaField
            label="상담 내용"
            value={content}
            maxLength={500}
            onChange={(event) => setContent(event.target.value)}
            placeholder="상담 내용을 입력해주세요"
            className="min-h-40"
          />
          <span className="mt-2 block text-right text-xs text-[#8A95A3]">
            {content.length}/500
          </span>
        </div>
      </ContentCard>

      {counselType === "career" ? (
        <ContentCard className="p-6 sm:p-8">
          <p className="text-xs font-bold tracking-[0.14em] text-[#8A95A3]">STEP 03</p>
          <h2 className="mt-2 text-xl font-bold text-[#13233A]">상담 선생님을 선택해주세요</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {TEACHERS.map((teacher) => (
              <button
                key={teacher}
                type="button"
                onClick={() => {
                  setSelectedTeacher((current) => current === teacher ? null : teacher);
                  setSelectedTime(null);
                }}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  selectedTeacher === teacher
                    ? "bg-[#02C551] text-white"
                    : "border border-gray-200 bg-white text-gray-700"
                }`}
              >
                {teacher}
              </button>
            ))}
          </div>
        </ContentCard>
      ) : null}

      <ContentCard className="p-6 sm:p-8">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-[#8A95A3]">
            {counselType === "career" ? "STEP 04" : "STEP 03"}
          </p>
          <h2 className="mt-2 text-xl font-bold text-[#13233A]">
            {counselType === "career" ? "진로 상담" : "일반 상담"} 일정을 선택해주세요
          </h2>
        </div>
        <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-3">
          {dates.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setSelectedDate((current) => current === item.value ? null : item.value)}
              className={`rounded-2xl px-2 py-3 text-center transition sm:px-3 ${
                selectedDate === item.value
                  ? "bg-[#02C551] text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-green-50"
              }`}
            >
              <span className="block text-xs opacity-70">{item.day}</span>
              <strong className="mt-1 block text-lg">{item.date}</strong>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {times.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setSelectedTime((current) => current === time ? null : time)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                selectedTime === time
                  ? "bg-[#02C551] text-white"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-green-300"
              }`}
            >
              {time}
            </button>
          ))}
        </div>

        {counselType === "career" &&
        selectedTeacher === "임경원 선생님" &&
        selectedTime?.endsWith("교시") ? (
          <p className="mt-4 text-sm font-medium text-red-600">
            수업 담당 선생님의 허가를 먼저 받아주세요.
          </p>
        ) : null}
      </ContentCard>
      <div className="flex justify-end gap-3">
        <ActionButton type="button" variant="secondary" onClick={handleCancel}>
          취소
        </ActionButton>
        <ActionButton type="submit" disabled={submitting} className="min-w-32 bg-[#10243E] hover:bg-[#1B3555]">
          {submitting ? "신청 중…" : "상담 신청"}
        </ActionButton>
      </div>
    </form>
  );
};
