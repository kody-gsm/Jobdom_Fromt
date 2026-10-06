"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@fsd/shared/api";
import { ACTIVITY_API_ENABLED, ACTIVITY_LABELS, activityApi, getActivityFilterError, getDefaultActivityFilter } from "@fsd/entities/user";
import type { ActivityEvent, ActivityFilter, ActivityPage, ActivityType, ActivityUser, ActivityUsersResponse } from "@fsd/entities/user";

const ROLE_LABELS = { STUDENT: "학생", TEACHER: "교사", WEE_TEACHER: "Wee 교사", ADMIN: "관리자" };
const inputClass = "mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm disabled:opacity-60";
const buttonClass = "rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-40";
const formatTime = (time: string) => new Date(time).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) return "관리자 계정으로 로그인해야 기록을 조회할 수 있습니다.";
  if (error instanceof ApiError && [404, 405, 501].includes(error.status)) return "기록 조회 기능이 아직 연결되지 않았습니다.";
  return error instanceof Error ? error.message : "활동 기록을 불러오지 못했습니다.";
};

export const ActivityRecords = () => {
  const [draft, setDraft] = useState(getDefaultActivityFilter);
  const [filter, setFilter] = useState(draft);
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<ActivityUsersResponse | null>(null);
  const [loading, setLoading] = useState(ACTIVITY_API_ENABLED);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [selected, setSelected] = useState<ActivityUser | null>(null);

  useEffect(() => {
    if (!ACTIVITY_API_ENABLED) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      setResult(null);
      try {
        const response = await activityApi.getUsers(filter, page, controller.signal);
        if (!controller.signal.aborted) setResult(response);
      } catch (caught) {
        if (!controller.signal.aborted) setError(getErrorMessage(caught));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [filter, page]);

  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = getActivityFilterError(draft);
    setFilterError(message);
    if (message) return;
    setSelected(null);
    setPage(0);
    setFilter({ ...draft });
  };

  let emptyMessage = "조회 조건에 맞는 활동 사용자가 없습니다.";
  if (loading) emptyMessage = "기록을 불러오는 중입니다.";
  else if (error || !ACTIVITY_API_ENABLED) emptyMessage = "기록을 조회할 수 없습니다.";

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200" aria-labelledby="activity-title">
      <header className="border-b border-gray-200 bg-gray-50 p-6 sm:p-8">
        <p className="text-xs font-bold text-green-600">사용 현황</p>
        <h2 id="activity-title" className="mt-3 text-2xl font-bold">사용자 활동 기록</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">페이지 방문과 성공한 주요 작업을 사용자별로 확인합니다. 조회 시간은 한국 시간 기준입니다.</p>
      </header>
      <div className="space-y-6 p-6 sm:p-8">
        <form onSubmit={search} className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm font-semibold">시작일
            <input type="date" required className={inputClass} value={draft.from} onChange={(event) => setDraft({ ...draft, from: event.target.value })} />
          </label>
          <label className="text-sm font-semibold">종료일
            <input type="date" required className={inputClass} value={draft.to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} />
          </label>
          <label className="text-sm font-semibold">사용자 검색
            <input type="search" maxLength={100} placeholder="이름 또는 학번" className={inputClass} value={draft.query} onChange={(event) => setDraft({ ...draft, query: event.target.value })} />
          </label>
          <label className="text-sm font-semibold">역할
            <select className={inputClass} value={draft.role} onChange={(event) => {
              const role = event.target.value;
              if (role === "" || role === "STUDENT" || role === "TEACHER" || role === "WEE_TEACHER" || role === "ADMIN") setDraft({ ...draft, role });
            }}>
              <option value="">전체 역할</option>
              {Object.entries(ROLE_LABELS).map(([role, label]) => <option key={role} value={role}>{label}</option>)}
            </select>
          </label>
          <button type="submit" disabled={loading || !ACTIVITY_API_ENABLED} className="h-11 rounded-xl bg-green-600 px-5 font-bold text-white disabled:opacity-50">{loading ? "조회 중…" : "조회"}</button>
        </form>
        {filterError && <p role="alert" className="text-sm text-red-700">{filterError}</p>}
        <dl className="grid grid-cols-3 gap-3">
          <Metric label="활동 사용자" value={result?.summary.activeUsers} unit="명" />
          <Metric label="페이지 방문" value={result?.summary.pageViews} unit="회" />
          <Metric label="성공한 작업" value={result?.summary.actions} unit="회" />
        </dl>
        {!ACTIVITY_API_ENABLED && <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">기록 조회 기능이 아직 연결되지 않았습니다.</p>}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <div aria-busy={loading} className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">사용자별 활동 수치. 이름을 선택하면 상세 기록이 표시됩니다.</caption>
            <thead className="bg-gray-50 text-gray-500"><tr>
              {["사용자", "학번", "역할", "방문", "작업", "최근 활동"].map((label) => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}
            </tr></thead>
            <tbody>
              {result?.users.items.map((user) => (
                <tr key={user.userId} className="border-t border-gray-100">
                  <td className="px-4 py-3"><button type="button" aria-pressed={selected?.userId === user.userId} aria-label={`${user.name} 기록 보기`} onClick={() => setSelected(user)} className="font-semibold text-green-700 underline underline-offset-4">{user.name}</button></td>
                  <td className="px-4 py-3">{user.studentNumber || "—"}</td>
                  <td className="px-4 py-3">{ROLE_LABELS[user.role]}</td>
                  <td className="px-4 py-3 tabular-nums">{user.pageViews.toLocaleString()}</td>
                  <td className="px-4 py-3 tabular-nums">{user.actions.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatTime(user.lastActiveAt)}</td>
                </tr>
              ))}
              {!result?.users.items.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">{emptyMessage}</td></tr>}
            </tbody>
          </table>
        </div>
        {result && <PageButtons page={page} totalPages={result.users.totalPages} totalElements={result.users.totalElements} onChange={(next) => { setSelected(null); setPage(next); }} />}
        {selected && <UserActivityHistory key={`${selected.userId}:${filter.from}:${filter.to}`} user={selected} filter={filter} onClose={() => setSelected(null)} />}
      </div>
    </section>
  );
};

const Metric = ({ label, value, unit }: { label: string; value?: number; unit: string }) => (
  <div className="rounded-2xl bg-green-50 p-4">
    <dt className="text-xs font-semibold text-gray-500">{label}</dt>
    <dd className="mt-2 text-2xl font-bold text-green-800">{value?.toLocaleString() ?? "—"}<span className="ml-1 text-xs font-normal">{unit}</span></dd>
  </div>
);

const PageButtons = ({ page, totalPages, totalElements, onChange }: { page: number; totalPages: number; totalElements: number; onChange: (page: number) => void }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
    <span>총 {totalElements.toLocaleString()}건 · {totalPages ? page + 1 : 0} / {totalPages} 페이지</span>
    <div className="flex gap-2">
      <button type="button" className={buttonClass} disabled={page === 0} onClick={() => onChange(page - 1)}>이전</button>
      <button type="button" className={buttonClass} disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>다음</button>
    </div>
  </div>
);

const UserActivityHistory = ({ user, filter, onClose }: { user: ActivityUser; filter: ActivityFilter; onClose: () => void }) => {
  const [query, setQuery] = useState<{ type: ActivityType | ""; page: number }>({ type: "", page: 0 });
  const [result, setResult] = useState<ActivityPage<ActivityEvent> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      setResult(null);
      try {
        const response = await activityApi.getEvents(user.userId, filter, query.type, query.page, controller.signal);
        if (!controller.signal.aborted) setResult(response);
      } catch (caught) {
        if (!controller.signal.aborted) setError(getErrorMessage(caught));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [user.userId, filter, query, revision]);

  let emptyMessage = "조회 조건에 맞는 기록이 없습니다.";
  if (loading) emptyMessage = "활동 이력을 불러오는 중입니다.";
  else if (error) emptyMessage = "활동 이력을 조회할 수 없습니다.";

  return (
    <section aria-labelledby="user-history-title" className="space-y-4 rounded-2xl border border-green-200 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="user-history-title" className="text-lg font-bold">{user.name} 활동 이력</h3>
        <button type="button" className={buttonClass} onClick={onClose}>상세 닫기</button>
      </div>
      <label className="block max-w-xs text-sm font-semibold">활동 종류
        <select value={query.type} className={inputClass} onChange={(event) => {
          const type = event.target.value;
          const isActivityType = (value: string): value is ActivityType => Object.hasOwn(ACTIVITY_LABELS, value);
          if (type === "" || isActivityType(type)) setQuery({ type, page: 0 });
        }}>
          <option value="">전체 활동</option>
          {Object.entries(ACTIVITY_LABELS).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
        </select>
      </label>
      {error && <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-red-700"><p>{error}</p><button type="button" className={buttonClass} onClick={() => setRevision((value) => value + 1)}>다시 조회</button></div>}
      <div aria-busy={loading} className="overflow-x-auto">
        <table className="w-full min-w-[540px] text-left text-sm">
          <caption className="sr-only">{user.name}의 활동 시간, 종류, 경로와 작업 응답 시간</caption>
          <thead className="text-gray-500"><tr>{["시간", "활동", "경로", "응답 시간"].map((label) => <th key={label} scope="col" className="px-3 py-3">{label}</th>)}</tr></thead>
          <tbody>
            {result?.items.map((event) => <tr key={event.id} className="border-t border-gray-100">
              <td className="px-3 py-3 whitespace-nowrap">{formatTime(event.occurredAt)}</td>
              <td className="px-3 py-3">{ACTIVITY_LABELS[event.type]}</td>
              <td className="px-3 py-3 break-all text-gray-500">{event.path}</td>
              <td className="px-3 py-3 whitespace-nowrap">{event.durationMs === null ? "—" : `${event.durationMs.toLocaleString()} ms`}</td>
            </tr>)}
            {!result?.items.length && <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-500">{emptyMessage}</td></tr>}
          </tbody>
        </table>
      </div>
      {result && <PageButtons page={query.page} totalPages={result.totalPages} totalElements={result.totalElements} onChange={(page) => setQuery({ ...query, page })} />}
    </section>
  );
};
