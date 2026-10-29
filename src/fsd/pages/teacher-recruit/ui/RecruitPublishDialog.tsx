"use client";

import { useEffect, useRef, useState } from "react";
import { NoticeChannelPicker } from "@fsd/features/manage-recruit";

/** 지원 폼 없이 만든 공고는 폼 화면을 거치지 않고 여기서 바로 공개한다. */
export function RecruitPublishDialog({ companyName, pending, error, onConfirm, onClose }: { companyName: string | null; pending: boolean; error: string; onConfirm: (channelId: string | null) => void; onClose: () => void }) {
  const [channelId, setChannelId] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => title.current?.focus(), []);
  const close = () => { if (!pending) onClose(); };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="recruit-publish-title" aria-describedby="recruit-publish-description" onKeyDown={(event) => { if (event.key === "Escape") close(); }}>
      <button type="button" aria-label="공고 공개 닫기" onClick={close} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 ref={title} tabIndex={-1} id="recruit-publish-title" className="text-xl font-bold outline-none">{companyName || "회사명 미입력"} 공고 공개</h2>
        <p id="recruit-publish-description" className="mb-4 mt-2 text-sm leading-6 text-gray-500">지원 폼 없이 공고만 게시합니다. 기본 공지 채널로 공고 알림이 발송되며, 다른 채널을 고르면 그 채널에도 알림을 추가로 보냅니다.</p>
        <NoticeChannelPicker value={channelId} onChange={setChannelId} disabled={pending} />
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" disabled={pending} onClick={close} className="h-11 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 disabled:opacity-50">취소</button>
          <button type="button" disabled={pending} onClick={() => onConfirm(channelId || null)} className="h-11 rounded-xl bg-[#02C551] text-sm font-bold text-white disabled:opacity-50">{pending ? "공개 중…" : "공개"}</button>
        </div>
      </div>
    </div>
  );
}
