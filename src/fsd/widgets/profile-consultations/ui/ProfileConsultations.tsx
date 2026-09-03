"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { ProfileConsultation } from "@fsd/entities/consultation";

type View = "reservations" | "history" | "history-detail" | null;

interface ProfileConsultationsProps {
  reservations: ProfileConsultation[];
  history: ProfileConsultation[];
  onCancel: (id: number) => Promise<void>;
  onSaveMemo: (id: number, memo: string) => void;
}

export const ProfileConsultations = ({
  reservations,
  history,
  onCancel,
  onSaveMemo,
}: ProfileConsultationsProps) => {
  const [view, setView] = useState<View>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState("");
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoInput, setMemoInput] = useState("");

  const selectedHistory = useMemo(
    () => history.find((item) => item.id === selectedHistoryId) ?? null,
    [history, selectedHistoryId],
  );

  const openHistoryDetail = (item: ProfileConsultation) => {
    setSelectedHistoryId(item.id);
    setMemoInput(item.myMemo || "");
    setIsEditingMemo(false);
    setView("history-detail");
  };

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

  const saveMemo = () => {
    if (!selectedHistory) return;
    onSaveMemo(selectedHistory.id, memoInput);
    setIsEditingMemo(false);
  };

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        <SummaryCard
          title="예약 현황"
          items={reservations}
          emptyText="예약된 상담이 없습니다"
          onOpen={() => setView("reservations")}
        />
        <SummaryCard
          title="상담 기록"
          items={history}
          emptyText="상담 기록이 없습니다"
          onOpen={() => setView("history")}
        />
      </div>

      {view === "reservations" && (
        <DialogFrame title="예약 현황" onClose={() => setView(null)}>
          <ConsultationList
            items={reservations}
            emptyText="예약된 상담이 없습니다."
            action={(item) => (
              <button
                type="button"
                onClick={() => setCancelTarget(item.id)}
                className="text-sm font-semibold text-red-600"
              >
                예약 취소
              </button>
            )}
          />
          <p className="mt-5 text-center text-xs text-gray-400">
            * 예약취소는 1시간 전부터 불가능합니다
          </p>
        </DialogFrame>
      )}

      {view === "history" && (
        <DialogFrame title="상담 기록" onClose={() => setView(null)}>
          <ConsultationList
            items={history}
            emptyText="상담 기록이 없습니다."
            action={(item) => (
              <button
                type="button"
                onClick={() => openHistoryDetail(item)}
                className="text-sm font-semibold text-green-600"
              >
                자세히 보기
              </button>
            )}
          />
        </DialogFrame>
      )}

      {view === "history-detail" && selectedHistory && (
        <DialogFrame title="상담 상세기록" onClose={() => setView(null)}>
          <div className="rounded-2xl bg-green-50 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-gray-400">상담 담당</p>
                <p className="mt-1 font-semibold">
                  {selectedHistory.counselor || "담당 선생님 정보 없음"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400">상담 일시</p>
                <p className="mt-1 font-semibold">
                  {selectedHistory.date} / {selectedHistory.slot}
                </p>
              </div>
            </div>
          </div>
          <section className="mt-5">
            <h3 className="text-sm font-bold">상담 내용</h3>
            <p className="mt-2 min-h-20 whitespace-pre-line rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">
              {selectedHistory.counselorComment || "기록된 상담 내용이 없습니다."}
            </p>
          </section>
          <section className="mt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">나의 메모</h3>
              {!isEditingMemo && (
                <button
                  type="button"
                  onClick={() => setIsEditingMemo(true)}
                  className="text-sm font-semibold text-green-600"
                >
                  {selectedHistory.myMemo ? "수정하기" : "작성하기"}
                </button>
              )}
            </div>
            {isEditingMemo ? (
              <div className="mt-2">
                <textarea
                  value={memoInput}
                  onChange={(event) => setMemoInput(event.target.value)}
                  className="min-h-24 w-full resize-none rounded-2xl border border-gray-200 p-4 text-sm outline-none focus:border-green-500"
                  placeholder="메모를 입력하세요..."
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMemoInput(selectedHistory.myMemo || "");
                      setIsEditingMemo(false);
                    }}
                    className="px-3 py-2 text-sm font-semibold text-gray-500"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={saveMemo}
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white"
                  >
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 min-h-20 whitespace-pre-line rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                {selectedHistory.myMemo || "아직 작성된 메모가 없습니다"}
              </p>
            )}
          </section>
        </DialogFrame>
      )}

      {cancelTarget !== null && (
        <DialogFrame title="예약 취소" onClose={() => setCancelTarget(null)} compact>
          <p className="text-center font-semibold text-gray-800">
            정말 예약을 취소하시는 건가요?
          </p>
          {cancelError && (
            <p role="alert" className="mt-3 text-center text-sm text-red-600">
              {cancelError}
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCancelTarget(null)}
              className="rounded-xl border border-gray-200 py-3 font-semibold"
            >
              아니요
            </button>
            <button
              type="button"
              onClick={() => void executeCancel()}
              className="rounded-xl bg-green-600 py-3 font-bold text-white"
            >
              예
            </button>
          </div>
        </DialogFrame>
      )}
    </>
  );
};

const SummaryCard = ({
  title,
  items,
  emptyText,
  onOpen,
}: {
  title: string;
  items: ProfileConsultation[];
  emptyText: string;
  onOpen: () => void;
}) => (
  <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <button type="button" onClick={onOpen} className="text-sm font-bold text-green-600">
        상세보기
      </button>
    </div>
    <div className="mt-4 space-y-3">
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">{emptyText}</p>
      ) : (
        items.slice(0, 2).map((item) => <ConsultationRow key={item.id} item={item} />)
      )}
    </div>
  </section>
);

const ConsultationRow = ({ item }: { item: ProfileConsultation }) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4">
    <span className="font-semibold text-gray-800">{item.type}</span>
    <span className="text-right text-sm text-gray-400">
      {item.date} / {item.slot}
    </span>
  </div>
);

const ConsultationList = ({
  items,
  emptyText,
  action,
}: {
  items: ProfileConsultation[];
  emptyText: string;
  action: (item: ProfileConsultation) => ReactNode;
}) => (
  <div className="max-h-80 space-y-3 overflow-y-auto">
    {items.length === 0 ? (
      <p className="py-16 text-center text-sm text-gray-400">{emptyText}</p>
    ) : (
      items.map((item) => (
        <div key={item.id} className="rounded-2xl bg-gray-50 p-4">
          <ConsultationRow item={item} />
          <div className="mt-2 flex justify-end">{action(item)}</div>
        </div>
      ))
    )}
  </div>
);

const DialogFrame = ({
  title,
  children,
  onClose,
  compact = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  compact?: boolean;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
    <button
      type="button"
      aria-label="닫기"
      onClick={onClose}
      className="absolute inset-0 bg-black/30 backdrop-blur-sm"
    />
    <div className={`relative z-10 w-full rounded-3xl bg-white p-6 shadow-2xl ${compact ? "max-w-sm" : "max-w-lg"}`}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <button type="button" onClick={onClose} className="text-sm font-semibold text-gray-400">
          닫기
        </button>
      </div>
      {children}
    </div>
  </div>
);
