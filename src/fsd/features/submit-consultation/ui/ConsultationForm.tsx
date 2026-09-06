"use client";

import type { ConsultationType } from "@fsd/entities/consultation";
import { ActionButton, ContentCard, SegmentedTabs, TextAreaField, TextField } from "@fsd/shared/ui";
import { useConsultationForm } from "../model/useConsultationForm.ts";
import { getConsultationTeacherLabel } from "../model/teacherOption.ts";
import {
  getConsultationPeriodTime,
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
    selectedTeacherId,
    selectedDate,
    selectedTime,
    submitting,
    toast,
    errorTarget,
    dates,
    times,
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

  return (
    <form onSubmit={handleSubmit}>
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

      <ContentCard className="mb-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-end gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-[#27364A]">상담 유형</p>
            <SegmentedTabs
              ariaLabel="상담 유형"
              className="[&_[aria-selected=true]]:!text-[#02C551] [&_[aria-selected=true]]:!ring-1 [&_[aria-selected=true]]:!ring-[#02C551]"
              items={[
                { value: "career", label: "진로 상담" },
                { value: "general", label: "일반 상담" },
              ]}
              value={counselType}
              onChange={handleTabChange}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-2 text-sm font-semibold text-[#27364A]">상담 선생님</p>
            <div
              data-consultation-field="teacher"
              className={`flex flex-wrap gap-2 rounded-xl ${
                errorTarget === "teacher" ? "border border-[#E53935] p-2" : ""
              }`}
            >
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => toggleTeacher(teacher)}
                  className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    selectedTeacherId === teacher.id
                      ? "border-[#02C551] bg-[#EAF9F0] text-[#02A946]"
                      : "border-[#DDE2E7] bg-white text-[#4E5B6B] hover:border-[#B8C1CC]"
                  }`}
                >
                  {getConsultationTeacherLabel(teacher.name)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ContentCard>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-start">
        <ContentCard className="p-6 sm:p-8 lg:min-h-[620px]">
          <div>
            <h2 className="text-xl font-bold text-[#13233A]">상담 내용 작성</h2>
            <p className="mt-2 text-sm leading-6 text-[#7A8592]">
              상담받고 싶은 내용을 편하게 작성해주세요.
            </p>
          </div>

          <div className="mt-6 space-y-5">
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
              <span className="mt-2 block text-right text-xs text-[#8A95A3]">
                {content.length} / 500자
              </span>
            </div>
          </div>
        </ContentCard>

        <ContentCard className="p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-[#13233A]">일정 예약</h2>
            <p className="mt-2 text-sm leading-6 text-[#7A8592]">
              상담 희망일과 교시를 선택해 주세요.
            </p>
          </div>

          <section className="mt-6">
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
                      ? "border-[#02C551] bg-[#EAF9F0] text-[#02A946]"
                      : "border-[#DDE2E7] bg-white text-[#4E5B6B] hover:border-[#B8C1CC]"
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
            <div
              data-consultation-field="period"
              className={`space-y-2 rounded-xl ${
                errorTarget === "period" ? "border border-[#E53935] p-2" : ""
              }`}
            >
              {times.map((time) => {
                const unavailable = isTimeUnavailable(time);
                return (
                  <button
                    key={time}
                    type="button"
                    disabled={unavailable}
                    onClick={() => toggleTime(time)}
                    className={`flex min-h-[48px] w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      unavailable
                        ? "cursor-not-allowed border-[#E3E6EA] bg-[#F5F6F7] text-[#A0A8B2]"
                        : selectedTime === time
                          ? "border-[#02C551] bg-[#EAF9F0] text-[#02A946]"
                          : "border-[#DDE2E7] bg-white text-[#27364A] hover:border-[#B8C1CC]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <strong className="shrink-0 text-base">{time}</strong>
                      {getConsultationPeriodTime(time) ? (
                        <span className="truncate font-normal text-[#596579]">
                          {getConsultationPeriodTime(time)}
                        </span>
                      ) : null}
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
