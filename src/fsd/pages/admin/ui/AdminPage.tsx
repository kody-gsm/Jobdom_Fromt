"use client";

import { useRef, useState } from "react";
import { ApiError } from "@fsd/shared/api";
import { syncStudents } from "@fsd/features/sync-students";
import { syncDiscordMembers } from "@fsd/features/sync-discord-members";
import type { DiscordMemberSyncResult } from "@fsd/features/sync-discord-members";
import { SiteHeader } from "@fsd/widgets/site-header";
import { ActivityRecords } from "./ActivityRecords.tsx";

export const AdminPage = () => {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ count: number; time: Date } | null>(null);
  const [error, setError] = useState("");

  const sync = async () => {
    try {
      setSyncing(true);
      setError("");
      const response = await syncStudents();
      setResult({ count: response.syncedCount, time: new Date() });
    } catch (caught) {
      setError(
        caught instanceof ApiError && [401, 403].includes(caught.status)
          ? "관리자 계정으로 로그인해야 실행할 수 있습니다."
          : caught instanceof Error
            ? caught.message
            : "학생 정보 동기화에 실패했습니다.",
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-5rem)] bg-white px-4 py-10 text-[#17201a] sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-sm font-bold text-green-600">ADMIN WORKSPACE</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">시스템 관리</h1>
          <p className="mt-2 text-sm text-gray-500">
            사용자 활동을 조회하고 외부 학생 정보를 잡담 사용자 데이터와 동기화합니다.
          </p>

          <ActivityRecords />

          <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 p-6 sm:p-8">
              <div>
                <p className="text-xs font-bold text-green-600">DataGSM 연결</p>
                <h2 className="mt-3 text-2xl font-bold">재학생 정보 동기화</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                  DataGSM의 재학생을 불러와 잡담 사용자 정보를 추가하거나 갱신합니다.
                </p>
              </div>
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-500">
                관리자 전용
              </span>
            </header>

            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_280px]">
              <dl className="grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-3">
                <Info label="동기화 대상" value="재학생 전체" />
                <Info label="처리 방식" value="추가 및 갱신" />
                <Info label="페이지 크기" value="최대 300명" />
              </dl>
              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-xs font-bold text-gray-500">최근 실행 결과</p>
                {result ? (
                  <>
                    <p className="mt-3 text-3xl font-bold text-green-700">
                      {result.count}
                      <span className="ml-1 text-sm text-gray-500">명 처리</span>
                    </p>
                    <time className="mt-2 block text-xs text-gray-400">
                      {result.time.toLocaleString("ko-KR")}
                    </time>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-gray-400">아직 실행하지 않았습니다.</p>
                )}
              </div>
            </div>

            {error && (
              <p role="alert" className="mx-6 mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-8">
                {error}
              </p>
            )}
            <footer className="flex justify-end border-t border-gray-200 px-6 py-5 sm:px-8">
              <button
                type="button"
                disabled={syncing}
                onClick={() => void sync()}
                className="h-12 rounded-xl bg-green-600 px-6 font-bold text-white disabled:cursor-wait disabled:opacity-60"
              >
                {syncing ? "동기화 중…" : "학생 정보 동기화"}
              </button>
            </footer>
          </section>

          <DiscordMemberSync />
        </div>
      </main>
    </>
  );
};

const Info = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white p-4">
    <dt className="text-xs font-bold text-gray-400">{label}</dt>
    <dd className="mt-2 font-bold text-gray-800">{value}</dd>
  </div>
);

const DiscordMemberSync = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<{ counts: DiscordMemberSyncResult; time: Date } | null>(null);
  const [error, setError] = useState("");
  const inFlight = useRef(false);

  const saveIds = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsSaving(true);
    setError("");
    try {
      const counts = await syncDiscordMembers();
      setResult({ counts, time: new Date() });
    } catch (caught) {
      setError(caught instanceof ApiError && [401, 403].includes(caught.status)
        ? "관리자 계정으로 로그인해야 실행할 수 있습니다."
        : caught instanceof Error ? caught.message : "학생 ID 저장에 실패했습니다.");
    } finally {
      inFlight.current = false;
      setIsSaving(false);
    }
  };

  return (
    <section aria-labelledby="discord-sync-title" aria-busy={isSaving} className="mt-8 overflow-hidden rounded-3xl border border-gray-200">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 p-6 sm:p-8">
        <div>
          <p className="text-xs font-bold text-green-600">Discord 연결</p>
          <h2 id="discord-sync-title" className="mt-3 text-2xl font-bold">학생 ID 저장</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Discord 서버 닉네임의 학번·이름을 학생 정보와 비교해 Discord 사용자 ID를 저장하고, 연결되지 않는 기존 ID를 정리합니다.
          </p>
        </div>
        <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-500">관리자 전용</span>
      </header>
      <div className="p-6 sm:p-8" role="status">
        <p className="text-xs font-bold text-gray-500">최근 성공 결과</p>
        {result ? (
          <>
            <dl className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-3">
              <Info label="조회한 Discord 회원" value={`${result.counts.scannedMembers.toLocaleString("ko-KR")}명`} />
              <Info label="연결된 학생" value={`${result.counts.linkedStudents.toLocaleString("ko-KR")}명`} />
              <Info label="ID 갱신·정리" value={`${result.counts.updatedStudents.toLocaleString("ko-KR")}명`} />
            </dl>
            <time dateTime={result.time.toISOString()} className="mt-3 block text-xs text-gray-400">
              {result.time.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
            </time>
          </>
        ) : <p className="mt-3 text-sm text-gray-400">아직 실행하지 않았습니다.</p>}
      </div>
      {error && (
        <div role="alert" className="mx-6 mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-8">
          <p>{error}</p>
          <button type="button" disabled={isSaving} onClick={() => void saveIds()} className="min-h-11 cursor-pointer font-semibold underline underline-offset-4 disabled:cursor-wait">다시 시도</button>
        </div>
      )}
      <footer className="flex justify-end border-t border-gray-200 px-6 py-5 sm:px-8">
        <button type="button" disabled={isSaving} onClick={() => void saveIds()} className="h-12 cursor-pointer rounded-xl bg-green-600 px-6 font-bold text-white disabled:cursor-wait disabled:opacity-60">
          {isSaving ? "저장 중…" : "학생 ID 저장"}
        </button>
      </footer>
    </section>
  );
};
