"use client";

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
  getConsultationWeekdayLabel,
} from "../model/schedulePresentation.ts";

export const ConsultationForm = ({
  initialType,
}: {
  initialType: ConsultationType;
}) => {
  const {
    counselType,
    title,
    content,
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
    handleTabChange,
    toggleTeacher,
    toggleDate,
    toggleTime,
    isTimeUnavailable,
    handleCancel,
    handleSubmit,
  } = useConsultationForm(initialType);
  const displayTeachers = getConsultationTeacherOptions(counselType, teachers);

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
                  errorTarget === "teacher" ? "border border-[#E53935] p-2" : ""
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
              className={`grid grid-cols-5 gap-2 rounded-xl ${
                errorTarget === "date" ? "border border-[#E53935] p-2" : ""
              }`}
            >
              {dates.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => toggleDate(item.value)}
                  className={`min-h-[68px] rounded-xl border px-2 py-2 text-center transition-colors ${
                    selectedDate === item.value
                      ? "border-brand bg-[#EAF9F0] text-brand-hover"
                      : "border-border bg-white text-[#4E5B6B] hover:border-[#B8C1CC]"
                  }`}
                >
                  <span className="block text-[11px] font-medium">
                    {getConsultationWeekdayLabel(item.value)}
                  </span>
                  <strong className="mt-1 block text-lg">{item.date}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <p className="mb-2 text-sm font-semibold text-[#27364A]">상담 교시</p>
            <div
              data-consultation-field="period"
              className={`space-y-2 rounded-xl ${
                errorTarget === "period" ? "border border-[#E53935] p-2" : ""
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
