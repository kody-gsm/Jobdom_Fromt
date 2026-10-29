"use client";

import { useEffect, useState } from "react";
import type { RecruitNoticeChannel } from "@fsd/entities/recruit";
import { ApiError } from "@fsd/shared/api";
import { getNoticeChannels } from "../api/recruitManagement.ts";

type ChannelGroup = { categoryName: string; channels: RecruitNoticeChannel[] };

const groupChannels = (channels: RecruitNoticeChannel[]) => channels.reduce<ChannelGroup[]>((groups, channel) => {
  const categoryName = channel.categoryName || "분류 없음";
  const group = groups.find((candidate) => candidate.categoryName === categoryName);
  if (group) group.channels.push(channel);
  else groups.push({ categoryName, channels: [channel] });
  return groups;
}, []);

const getLoadErrorMessage = (error: unknown) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) return "선생님 계정으로 로그인해야 디스코드 채널을 불러올 수 있습니다.";
  return error instanceof Error ? error.message : "디스코드 채널 목록을 불러오지 못했습니다.";
};

/** 기본 공지 채널 외에 공고 알림을 추가로 보낼 디스코드 채널을 고른다. 빈 값은 기본 채널만 쓴다는 뜻이다. */
export function NoticeChannelPicker({ value, onChange, disabled }: { value: string; onChange: (channelId: string) => void; disabled: boolean }) {
  const [channels, setChannels] = useState<RecruitNoticeChannel[] | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setError("");
      try {
        const loaded = await getNoticeChannels(controller.signal);
        if (!controller.signal.aborted) setChannels(loaded);
      } catch (caught) {
        if (!controller.signal.aborted) setError(getLoadErrorMessage(caught));
      }
    };
    void load();
    return () => controller.abort();
  }, [revision]);

  return (
    <div>
      <label className="block max-w-sm text-xs font-bold text-gray-600">
        디스코드 알림 채널
        <select disabled={disabled || channels === null} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-normal outline-none focus:border-[#02C551] disabled:opacity-60">
          <option value="">기본 공지 채널만</option>
          {channels && groupChannels(channels).map((group) => (
            <optgroup key={group.categoryName} label={group.categoryName}>
              {group.channels.map((channel) => <option key={channel.id} value={channel.id}># {channel.name}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      {channels === null && !error && <p role="status" className="mt-2 text-xs text-gray-500">디스코드 채널 목록을 불러오는 중입니다.</p>}
      {error && (
        <div role="alert" className="mt-2 flex flex-wrap items-center gap-2 text-xs text-red-700">
          <p>{error} 기본 공지 채널로만 공개할 수 있습니다.</p>
          <button type="button" disabled={disabled} onClick={() => setRevision((current) => current + 1)} className="min-h-9 rounded-lg border border-red-200 bg-white px-3 font-semibold disabled:opacity-50">다시 불러오기</button>
        </div>
      )}
    </div>
  );
}
