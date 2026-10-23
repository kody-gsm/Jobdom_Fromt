"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@fsd/shared/api";
import { fillApiStatisticsDays, getApiStatistics, getApiStatisticsFilterError, getDefaultApiStatisticsFilter, getErrorRate } from "@fsd/features/view-api-statistics";
import type { ApiStatistics as ApiStatisticsResult, ApiStatisticsDaily, ApiStatisticsEndpoint } from "@fsd/features/view-api-statistics";

const ENDPOINT_PREVIEW_COUNT = 10;
const inputClass = "mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm disabled:opacity-60";
const buttonClass = "rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-40";
const formatCount = (value: number) => value.toLocaleString("ko-KR");
const formatDuration = (value: number) => `${value.toLocaleString("ko-KR", { maximumFractionDigits: 1 })} ms`;
const formatShortDate = (date: string) => date.slice(5).replace("-", ".");
const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) return "관리자 계정으로 로그인해야 통계를 조회할 수 있습니다.";
  if (error instanceof ApiError && [404, 405, 501].includes(error.status)) return "API 통계 기능이 아직 연결되지 않았습니다.";
  return error instanceof Error ? error.message : "API 통계를 불러오지 못했습니다.";
};
const getStatusClass = (status: number) => {
  if (status >= 500) return "bg-red-50 text-red-700";
  if (status >= 400) return "bg-amber-50 text-amber-800";
  return "bg-gray-100 text-gray-700";
};

export const ApiStatistics = () => {
  const [draft, setDraft] = useState(getDefaultApiStatisticsFilter);
  const [filter, setFilter] = useState(draft);
  const [result, setResult] = useState<ApiStatisticsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getApiStatistics(filter, controller.signal);
        if (!controller.signal.aborted) setResult(response);
      } catch (caught) {
        if (!controller.signal.aborted) {
          setResult(null);
          setError(getErrorMessage(caught));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [filter, revision]);

  const search = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = getApiStatisticsFilterError(draft);
    setFilterError(message);
    if (message) return;
    setFilter({ ...draft });
  };

  const errorRate = result ? getErrorRate(result.totalCalls, result.errorCalls) : null;

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-gray-200" aria-labelledby="api-statistics-title">
      <header className="border-b border-gray-200 bg-gray-50 p-6 sm:p-8">
        <p className="text-xs font-bold text-green-600">서버 상태</p>
        <h2 id="api-statistics-title" className="mt-3 text-2xl font-bold">API 호출 통계</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">경로·메서드·응답 상태별 호출 수와 평균 처리 시간을 확인합니다. 날짜는 한국 시간 기준이며 최대 366일까지 조회할 수 있습니다.</p>
      </header>
      <div className="space-y-6 p-6 sm:p-8">
        <form onSubmit={search} className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <label className="text-sm font-semibold">시작일
            <input type="date" required className={inputClass} value={draft.from} onChange={(event) => setDraft({ ...draft, from: event.target.value })} />
          </label>
          <label className="text-sm font-semibold">종료일
            <input type="date" required className={inputClass} value={draft.to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} />
          </label>
          <button type="submit" disabled={loading} className="h-11 rounded-xl bg-green-600 px-5 font-bold text-white disabled:opacity-50">{loading ? "조회 중…" : "조회"}</button>
        </form>
        {filterError && <p role="alert" className="text-sm text-red-700">{filterError}</p>}
        {error && (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button type="button" disabled={loading} className="font-semibold underline underline-offset-4 disabled:opacity-50" onClick={() => setRevision((value) => value + 1)}>다시 조회</button>
          </div>
        )}
        <div aria-busy={loading} className={`space-y-6 transition-opacity ${loading && result ? "opacity-60" : ""}`}>
          <dl className="grid gap-3 sm:grid-cols-3">
            <Metric label="전체 호출" value={result ? formatCount(result.totalCalls) : undefined} unit="회" />
            <Metric label="오류 응답 (4xx·5xx)" value={result ? formatCount(result.errorCalls) : undefined} unit={errorRate === null ? "회" : `회 · ${errorRate}%`} />
            <Metric label="평균 처리 시간" value={result?.averageDurationMs.toLocaleString("ko-KR", { maximumFractionDigits: 1 })} unit="ms" />
          </dl>
          {result ? (
            <>
              <DailyCallsChart key={`${result.from}:${result.to}`} days={fillApiStatisticsDays(result.from, result.to, result.daily)} />
              <EndpointTable key={`endpoints:${result.from}:${result.to}`} endpoints={result.endpoints} />
            </>
          ) : (
            <p className="rounded-xl border border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
              {loading ? "통계를 불러오는 중입니다." : "통계를 조회할 수 없습니다."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

const Metric = ({ label, value, unit }: { label: string; value?: string; unit: string }) => (
  <div className="rounded-2xl bg-green-50 p-4">
    <dt className="text-xs font-semibold text-gray-500">{label}</dt>
    <dd className="mt-2 text-2xl font-bold text-green-800">{value ?? "—"}<span className="ml-1 text-xs font-normal">{unit}</span></dd>
  </div>
);

const DailyCallsChart = ({ days }: { days: ApiStatisticsDaily[] }) => {
  const [activeIndex, setActiveIndex] = useState(days.length - 1);
  const active = days[activeIndex];
  const maxCalls = Math.max(1, ...days.map((day) => day.calls));
  const axisDates = [days[0], days[Math.floor((days.length - 1) / 2)], days.at(-1)];

  return (
    <figure className="rounded-2xl border border-gray-200 p-4 sm:p-5">
      <figcaption className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-bold">일별 호출</span>
        <span className="flex gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-sm bg-teal-600" />정상 응답</span>
          <span className="flex items-center gap-1.5"><span aria-hidden className="size-2.5 rounded-sm bg-red-600" />오류 응답</span>
        </span>
      </figcaption>
      {active && (
        <p aria-live="polite" className="mt-3 text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{active.date}</span>
          {" · "}전체 <span className="tabular-nums">{formatCount(active.calls)}</span>회
          {" · "}오류 <span className="tabular-nums">{formatCount(active.errorCalls)}</span>회 ({getErrorRate(active.calls, active.errorCalls)}%)
        </p>
      )}
      <div className="mt-1 overflow-x-auto pt-5">
        <div style={{ minWidth: days.length * 8 }}>
          <div className="relative h-40 border-y border-gray-100">
            <span className="absolute left-0 top-0 -translate-y-full pb-0.5 text-[11px] text-gray-400 tabular-nums">{formatCount(maxCalls)}</span>
            <div className="flex h-full items-stretch gap-[2px]">
              {days.map((day, index) => {
                const normalCalls = day.calls - day.errorCalls;
                return (
                  <button
                    key={day.date}
                    type="button"
                    aria-label={`${day.date} 전체 ${day.calls}회, 오류 ${day.errorCalls}회`}
                    aria-pressed={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    onClick={() => setActiveIndex(index)}
                    className={`flex min-w-0 flex-1 flex-col justify-end gap-[2px] rounded-t ${index === activeIndex ? "bg-gray-100" : ""}`}
                  >
                    {day.errorCalls > 0 && <span className="block min-h-[2px] w-full rounded-t bg-red-600" style={{ height: `${(day.errorCalls / maxCalls) * 100}%` }} />}
                    {normalCalls > 0 && <span className={`block min-h-[2px] w-full bg-teal-600 ${day.errorCalls > 0 ? "" : "rounded-t"}`} style={{ height: `${(normalCalls / maxCalls) * 100}%` }} />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-gray-400 tabular-nums">
            {axisDates.map((day, index) => <span key={`${day?.date}:${index}`}>{day ? formatShortDate(day.date) : ""}</span>)}
          </div>
        </div>
      </div>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold text-gray-600">일별 수치 표로 보기</summary>
        <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-gray-50 text-gray-500"><tr>
              {["날짜", "전체 호출", "오류 응답", "오류율"].map((label) => <th key={label} scope="col" className="px-4 py-2 font-semibold">{label}</th>)}
            </tr></thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.date} className="border-t border-gray-100">
                  <td className="px-4 py-2 tabular-nums">{day.date}</td>
                  <td className="px-4 py-2 tabular-nums">{formatCount(day.calls)}</td>
                  <td className="px-4 py-2 tabular-nums">{formatCount(day.errorCalls)}</td>
                  <td className="px-4 py-2 tabular-nums">{getErrorRate(day.calls, day.errorCalls)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
};

const EndpointTable = ({ endpoints }: { endpoints: ApiStatisticsEndpoint[] }) => {
  const [isErrorOnly, setIsErrorOnly] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleEndpoints = isErrorOnly ? endpoints.filter((endpoint) => endpoint.status >= 400) : endpoints;
  const rows = isExpanded ? visibleEndpoints : visibleEndpoints.slice(0, ENDPOINT_PREVIEW_COUNT);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold">경로별 호출</h3>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" className="size-4 accent-green-600" checked={isErrorOnly} onChange={(event) => setIsErrorOnly(event.target.checked)} />
          오류 응답만 보기
        </label>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">경로, 메서드, 응답 상태별 호출 수와 평균 처리 시간. 호출 수가 많은 순서입니다.</caption>
          <thead className="bg-gray-50 text-gray-500"><tr>
            {["메서드", "경로", "상태", "호출", "평균 처리 시간"].map((label) => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((endpoint) => (
              <tr key={`${endpoint.method} ${endpoint.route} ${endpoint.status}`} className="border-t border-gray-100">
                <td className="px-4 py-3 font-mono text-xs font-semibold">{endpoint.method}</td>
                <td className="px-4 py-3 break-all font-mono text-xs text-gray-700">{endpoint.route}</td>
                <td className="px-4 py-3"><span className={`rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ${getStatusClass(endpoint.status)}`}>{endpoint.status}</span></td>
                <td className="px-4 py-3 tabular-nums">{formatCount(endpoint.calls)}</td>
                <td className="px-4 py-3 whitespace-nowrap tabular-nums">{formatDuration(endpoint.averageDurationMs)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">조회 기간에 해당하는 호출 기록이 없습니다.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
        <p>인증 실패나 매핑되지 않은 요청은 UNMATCHED 경로로 집계됩니다.</p>
        {visibleEndpoints.length > ENDPOINT_PREVIEW_COUNT && (
          <button type="button" className={buttonClass} onClick={() => setIsExpanded((value) => !value)}>
            {isExpanded ? "상위 10개만 보기" : `전체 ${formatCount(visibleEndpoints.length)}개 보기`}
          </button>
        )}
      </div>
    </div>
  );
};
