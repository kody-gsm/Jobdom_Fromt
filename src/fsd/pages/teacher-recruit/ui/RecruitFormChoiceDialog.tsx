"use client";

import { useEffect, useRef } from "react";

/** 지원 폼 생성 여부는 공고를 처음 만들 때만 정할 수 있어 생성 직전에 묻는다. */
export function RecruitFormChoiceDialog({ pending, error, onChoose, onClose }: { pending: boolean; error: string; onChoose: (createForm: boolean) => void; onClose: () => void }) {
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => title.current?.focus(), []);
  const close = () => { if (!pending) onClose(); };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="recruit-form-choice-title" aria-describedby="recruit-form-choice-description" onKeyDown={(event) => { if (event.key === "Escape") close(); }}>
      <button type="button" aria-label="지원 폼 선택 닫기" onClick={close} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 ref={title} tabIndex={-1} id="recruit-form-choice-title" className="text-xl font-bold outline-none">지원 폼을 함께 만들까요?</h2>
        <p id="recruit-form-choice-description" className="mt-2 text-sm leading-6 text-gray-500">이 선택은 공고를 처음 만들 때만 할 수 있고, 나중에 바꿀 수 없습니다.</p>
        <div className="mt-5 grid gap-3">
          <button type="button" disabled={pending} onClick={() => onChoose(true)} className="rounded-2xl border border-[#02C551] bg-[#effbf3] p-4 text-left disabled:opacity-50">
            <span className="block font-bold text-[#02a946]">지원 폼 만들기</span>
            <span className="mt-1 block text-xs leading-5 text-gray-600">학번·이름·포트폴리오 질문이 들어간 지원 폼을 함께 만듭니다. 폼을 작성한 뒤 공고와 함께 공개합니다.</span>
          </button>
          <button type="button" disabled={pending} onClick={() => onChoose(false)} className="rounded-2xl border border-gray-200 bg-white p-4 text-left disabled:opacity-50">
            <span className="block font-bold text-gray-800">폼 없이 만들기</span>
            <span className="mt-1 block text-xs leading-5 text-gray-600">지원 폼 없이 공고만 만듭니다. 공고 화면에서 바로 공개합니다.</span>
          </button>
        </div>
        {pending && <p role="status" className="mt-4 text-sm text-gray-500">공고를 만드는 중입니다.</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="button" disabled={pending} onClick={close} className="mt-5 h-11 w-full rounded-xl border border-gray-200 text-sm font-bold text-gray-600 disabled:opacity-50">취소</button>
      </div>
    </div>
  );
}
