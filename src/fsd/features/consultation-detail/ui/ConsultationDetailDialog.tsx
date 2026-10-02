"use client";

import { useState } from "react";
import {
  canEditConsultation,
  createConsultationApi,
  getReservationPresentation,
  toConsultationUpdateInput,
  type ConsultationDetailItem,
  type CounselingCategory,
} from "@fsd/entities/consultation";
import { requestWithSession } from "@fsd/entities/user";
import { ActionButton } from "@fsd/shared/ui";

const consultationApi = createConsultationApi(requestWithSession);
const CATEGORY_OPTIONS: CounselingCategory[] = ["학업", "취업", "진학", "생활", "기타"];

interface ConsultationDetailDialogProps {
  consultation: ConsultationDetailItem | null;
  onClose: () => void;
  onSaved?: (consultation: ConsultationDetailItem) => void;
}

export const ConsultationDetailDialog = ({
  consultation,
  onClose,
  onSaved,
}: ConsultationDetailDialogProps) => {
  if (!consultation) return null;

  return (
    <ConsultationDetailDialogContent
      key={`${consultation.kind}-${consultation.reservationId}-${consultation.status}`}
      consultation={consultation}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
};

const ConsultationDetailDialogContent = ({
  consultation,
  onClose,
  onSaved,
}: ConsultationDetailDialogProps & { consultation: ConsultationDetailItem }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<CounselingCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const presentation = getReservationPresentation(consultation.status);
  const editable = canEditConsultation(consultation.status);

  const save = async () => {
    if (!title.trim()) {
      setError("상담 제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setError("상담 내용을 입력해주세요.");
      return;
    }
    if (!category) {
      setError("상담 분야를 선택해주세요.");
      return;
    }

    const input = toConsultationUpdateInput({ title, content, category });
    try {
      setSaving(true);
      setError("");
      await consultationApi.update(consultation.kind, consultation.reservationId, input);
      const updated = { ...consultation, ...input };
      setTitle(updated.title);
      setContent(updated.content);
      setCategory(updated.category);
      setEditing(false);
      setSavedMessage("상담 내용이 수정되었습니다.");
      onSaved?.(updated);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "상담 내용을 수정하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-detail-title"
    >
      <button
        type="button"
        aria-label="상담 상세 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />
      <div className="relative z-10 max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-brand-accent">{consultation.type}</p>
            <h2 id="consultation-detail-title" className="mt-1 text-2xl font-bold text-ink">
              상담 신청 내용
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold text-muted hover:bg-surface"
          >
            닫기
          </button>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl bg-[#F7F8FA] p-5 text-sm sm:grid-cols-2">
          <Detail label="상태" value={presentation.statusLabel} />
          <Detail label="상담 선생님" value={consultation.teacherName || "확인 중"} />
          <Detail label="상담 일시" value={`${consultation.date.replaceAll("-", ".")} / ${consultation.period}`} />
          <Detail label="상담 분야" value={consultation.category || "미입력"} />
        </div>

        {savedMessage ? (
          <p role="status" className="mt-4 rounded-xl bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-hover">
            {savedMessage}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 space-y-5">
          {editing ? (
            <label className="block text-sm font-semibold text-[#27364A]">
              상담 제목
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-border bg-white px-4 text-sm font-normal text-ink outline-none focus:border-brand"
              />
            </label>
          ) : (
            <DetailBlock label="상담 제목" value={consultation.title || "입력된 제목이 없습니다."} />
          )}

          {editing ? (
            <div>
              <p className="text-sm font-semibold text-[#27364A]">상담 분야</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={category === option}
                    onClick={() => setCategory(option)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold ${category === option ? "border-brand bg-brand-soft text-brand-accent" : "border-border bg-white text-secondary-text hover:border-brand"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {editing ? (
            <label className="block text-sm font-semibold text-[#27364A]">
              구체적인 고민 내용
              <textarea
                value={content}
                maxLength={500}
                onChange={(event) => setContent(event.target.value)}
                className="mt-2 min-h-40 w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm font-normal leading-7 text-ink outline-none focus:border-brand"
              />
              <span className="mt-1 block text-right text-xs font-normal text-muted">{content.length} / 500자</span>
            </label>
          ) : (
            <DetailBlock label="구체적인 고민 내용" value={consultation.content || "입력된 내용이 없습니다."} multiline />
          )}
        </div>

        <div className="mt-7 flex justify-end gap-3">
          {editable && !editing ? (
            <ActionButton type="button" onClick={() => setEditing(true)}>
              내용 수정
            </ActionButton>
          ) : null}
          {editing ? (
            <>
              <ActionButton type="button" variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
                취소
              </ActionButton>
              <ActionButton type="button" onClick={() => void save()} disabled={saving}>
                {saving ? "저장 중…" : "저장"}
              </ActionButton>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold text-muted">{label}</p>
    <p className="mt-1 font-semibold text-[#4E5B6B]">{value}</p>
  </div>
);

const DetailBlock = ({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) => (
  <div>
    <p className="text-sm font-semibold text-[#27364A]">{label}</p>
    <p className={`mt-2 rounded-2xl bg-[#F7F8FA] px-4 py-4 text-sm leading-7 text-[#4E5B6B] ${multiline ? "whitespace-pre-wrap" : ""}`}>
      {value}
    </p>
  </div>
);
