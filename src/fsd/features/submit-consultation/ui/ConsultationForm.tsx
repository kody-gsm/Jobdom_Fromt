"use client";

import { useMemo, useState } from "react";
import type { ConsultationType } from "@fsd/entities/consultation";
import {
  ActionButton,
  ContentCard,
  SegmentedTabs,
  TextAreaField,
  TextField,
} from "@fsd/shared/ui";
import { useConsultationForm } from "../model/useConsultationForm.ts";
import {
  getConsultationTeacherLabel,
  getConsultationTeacherOptions,
} from "../model/teacherOption.ts";
import {
  CONSULTATION_SCHEDULE_ROWS,
} from "../model/schedulePresentation.ts";

const WEEKDAY_HEADERS = ["일", "월", "화", "수", "목", "금", "토"];

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const ConsultationForm = ({
  initialType,
}: {
  initialType: ConsultationType;
}) => {
  const {
    counselType,
    title,
    content,
    category,
    otherCategory,
    teachers,
    teacherStatus,
    selectedTeacher,
    selectedDate,
    selectedTime,
    submitting,
    toast,
    errorTarget,
    dates,
    setTitle,
    setContent,
    setCategory,
    setOtherCategory,
    handleTabChange,
    toggleTeacher,
    toggleDate,
    toggleTime,
    isTimeUnavailable,
    handleCancel,
    handleSubmit,
  } = useConsultationForm(initialType);
  const displayTeachers = getConsultationTeacherOptions(counselType, teachers);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const availableDateValues = useMemo(
    () => new Set(dates.map((item) => item.value)),
    [dates],
  );
  const calendarCells = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: lastDate }, (_, index) => new Date(year, month, index + 1)),
    ];
  }, [calendarDate]);
  const isDateAvailable = (date: Date) => availableDateValues.has(toDateValue(date));

  return (
    <form onSubmit={handleSubmit}>
      {toast ? (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`fixed right-6 top-6 z-[60] rounded-2xl px-5 py-4 text-sm font-semibold text-white shadow-lg ${
            toast.type === "success" ? "bg-brand" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-stretch">
        <ContentCard className="h-full min-h-[720px] p-6 sm:p-8">
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-[#27364A]">상담 유형</p>
              <SegmentedTabs
                ariaLabel="상담 유형"
                className="[&_[aria-selected=true]]:!text-brand [&_[aria-selected=true]]:!ring-1 [&_[aria-selected=true]]:!ring-brand"
                items={[
                  { value: "career", label: "취업 진로 상담" },
                  { value: "general", label: "일반 상담" },
                ]}
                value={counselType}
                onChange={handleTabChange}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-[#27364A]">상담 선생님</p>
              <div
                data-consultation-field="teacher"
                className={`flex min-h-11 flex-wrap gap-2 rounded-xl ${
                  errorTarget === "teacher" ? "ring-1 ring-[#E53935]" : ""
                }`}
              >
                {teacherStatus === "loading" ? (
                  <p className="px-1 py-2 text-sm font-semibold text-muted">선생님 정보를 불러오는 중입니다.</p>
                ) : teacherStatus === "error" ? (
                  <p role="alert" className="px-1 py-2 text-sm font-semibold text-red-600">
                    선생님 정보를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.
                  </p>
                ) : displayTeachers.length === 0 ? (
                  <p className="px-1 py-2 text-sm font-semibold text-muted">선택 가능한 선생님이 없습니다.</p>
                ) : (
                  displayTeachers.map((teacher) => (
                    <button
                      key={teacher.id}
                      type="button"
                      onClick={() => toggleTeacher(teacher)}
                      className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                        selectedTeacher?.id === teacher.id
                          ? "border-brand bg-[#EAF9F0] text-brand-hover"
                          : "border-border bg-white text-[#4E5B6B] hover:border-[#B8C1CC]"
                      }`}
                    >
                      {getConsultationTeacherLabel(teacher.name)}
                    </button>
                  ))
                )}
              </div>
            </div>

            <TextField
              data-consultation-field="title"
              error={errorTarget === "title" ? "제목을 입력해주세요" : undefined}
              label="상담 제목"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="고민거리 한 줄 요약을 적어주세요"
            />

            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#27364A]">상담 카테고리</p>
              <div className="flex flex-wrap gap-2">
                {["학업", "취업", "진학", "생활", "기타"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                      category === item
                        ? "border-brand bg-[#EAF9F0] text-brand-hover"
                        : "border-border bg-white text-[#4E5B6B] hover:border-[#B8C1CC]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {category === "기타" ? (
                <TextField
                  data-consultation-field="otherCategory"
                  label="기타 상담 내용"
                  value={otherCategory}
                  onChange={(event) => setOtherCategory(event.target.value)}
                  placeholder="상담 카테고리를 입력해주세요."
                />
              ) : null}
            </div>

            <div>
              <TextAreaField
                data-consultation-field="content"
                error={errorTarget === "content" ? "내용을 입력해주세요" : undefined}
                label="구체적인 고민 내용"
                value={content}
                maxLength={500}
                onChange={(event) => setContent(event.target.value)}
                placeholder="상담하고 싶은 내용을 자유롭고 편하게 작성해주세요."
                className="min-h-[320px] resize-none"
              />
              <span className="mt-2 block text-right text-xs text-muted">
                {content.length} / 500자
              </span>
            </div>
          </div>
        </ContentCard>

        <ContentCard className="h-full min-h-[720px] p-6 sm:p-8">
          <section>
            <p className="mb-2 text-sm font-semibold text-[#27364A]">상담 희망일</p>
            <div
              data-consultation-field="date"
              className={`rounded-xl ${
                errorTarget === "date" ? "ring-1 ring-[#E53935]" : ""
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <button type="button" onClick={() => setCalendarDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))} className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-[#F5F6F7]">이전 달</button>
                <strong className="text-base text-[#111827]">{calendarDate.toLocaleString("ko-KR", { month: "long", year: "numeric" })}</strong>
                <button type="button" onClick={() => setCalendarDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))} className="rounded-lg px-2 py-1 text-sm text-muted hover:bg-[#F5F6F7]">다음 달</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
                {WEEKDAY_HEADERS.map((day, index) => <span key={`${day}-${index}`} className={`py-2 ${index === 0 ? "text-blue-600" : index === 6 ? "text-red-600" : ""}`}>{day}</span>)}
                {calendarCells.map((date, index) => {
                  if (!date) return <span key={`empty-${index}`} className="h-10" />;
                  const value = toDateValue(date);
                  const available = isDateAvailable(date);
                  const weekendColor = date.getDay() === 0 ? "text-blue-600" : date.getDay() === 6 ? "text-red-600" : "text-[#C4C9D0]";
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!available}
                      onClick={() => toggleDate(value)}
                      className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
                        !available
                          ? `cursor-not-allowed border-border bg-white ${weekendColor}`
                          : selectedDate === value
                            ? "bg-brand text-white"
                            : "text-[#27364A] hover:bg-[#EAF9F0]"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-6">
            <p className="mb-2 text-sm font-semibold text-[#27364A]">상담 교시</p>
            <div
              data-consultation-field="period"
              className={`space-y-2 rounded-xl ${
                errorTarget === "period" ? "ring-1 ring-[#E53935]" : ""
              }`}
            >
              {CONSULTATION_SCHEDULE_ROWS.map((row) => {
                const unavailable = isTimeUnavailable(row.period);
                return (
                  <button
                    key={row.period}
                    type="button"
                    disabled={unavailable}
                    onClick={() => toggleTime(row.period)}
                    className={`flex min-h-[48px] w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      unavailable
                        ? "cursor-not-allowed border-[#E3E6EA] bg-[#F5F6F7] text-[#A0A8B2]"
                        : selectedTime === row.period
                          ? "border-brand bg-[#EAF9F0] text-brand-hover"
                          : "border-border bg-white text-[#27364A] hover:border-[#B8C1CC]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <strong className="shrink-0 text-base">{row.period}</strong>
                      <span className="truncate font-normal text-[#596579]">{row.time}</span>
                    </span>
                    {unavailable ? (
                      <span className="shrink-0 text-xs font-semibold">예약 불가</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <ActionButton
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="w-full"
            >
              취소
            </ActionButton>
            <ActionButton type="submit" disabled={submitting} className="w-full">
              {submitting ? "신청 중…" : "상담 신청"}
            </ActionButton>
          </div>
        </ContentCard>
      </div>
    </form>
  );
};
