"use client";

import { useConsultationForm } from "../model/useConsultationForm.ts";
import { TEACHERS } from "@fsd/entities/consultation";
import type { ConsultationType } from "@fsd/entities/consultation";
import { ActionButton, ContentCard, SegmentedTabs, TextAreaField, TextField } from "@fsd/shared/ui";

export const ConsultationForm = ({
  initialType,
}: {
  initialType: ConsultationType;
}) => {
  const {
    counselType,
    title,
    content,
    selectedTeacher,
    selectedDate,
    selectedTime,
    submitting,
    toast,
    dates,
    times,
    setTitle,
    setContent,
    handleTabChange,
    toggleTeacher,
    toggleDate,
    toggleTime,
    handleCancel,
    handleSubmit,
  } = useConsultationForm(initialType);

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
                onClick={() => toggleTeacher(teacher)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  selectedTeacher === teacher
                    ? "bg-[#10243E] text-white"
                    : "border border-[#DDE2E7] bg-white text-[#4E5B6B] hover:border-[#AEB9C5]"
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
        <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(44px,1fr))] gap-2 sm:grid-cols-5 sm:gap-3">
          {dates.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => toggleDate(item.value)}
              className={`rounded-2xl px-2 py-3 text-center transition sm:px-3 ${
                selectedDate === item.value
                  ? "bg-[#10243E] text-white"
                  : "bg-[#F7F8FA] text-[#4E5B6B] hover:bg-[#EEF3F8]"
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
              onClick={() => toggleTime(time)}
              className={`rounded-xl min-h-11 px-4 py-2.5 text-sm font-semibold transition ${
                selectedTime === time
                  ? "bg-[#10243E] text-white"
                  : "border border-[#DDE2E7] bg-white text-[#4E5B6B] hover:border-[#AEB9C5]"
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
