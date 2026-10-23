import { getApiStatisticsFilterError, isCalendarDate } from "../model/apiStatistics.ts";
import type { ApiStatistics, ApiStatisticsDaily, ApiStatisticsEndpoint, ApiStatisticsFilter } from "../model/apiStatistics.ts";

type RequestFn = <T>(path: string, init?: RequestInit) => Promise<T>;
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isCount = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const isDuration = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;
const isDate = (value: unknown): value is string => typeof value === "string" && isCalendarDate(value);
const isDaily = (value: unknown): value is ApiStatisticsDaily => isRecord(value)
  && isDate(value.date) && isCount(value.calls) && isCount(value.errorCalls) && value.errorCalls <= value.calls;
const isEndpoint = (value: unknown): value is ApiStatisticsEndpoint => isRecord(value)
  && typeof value.method === "string" && /^[A-Z]+$/.test(value.method)
  && typeof value.route === "string" && value.route.length > 0
  && typeof value.status === "number" && Number.isInteger(value.status) && value.status >= 100 && value.status <= 599
  && isCount(value.calls) && isDuration(value.averageDurationMs);

const requestSignal = (signal?: AbortSignal) => signal
  ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000);

export const createApiStatisticsApi = (request: RequestFn) => async (filter: ApiStatisticsFilter, signal?: AbortSignal): Promise<ApiStatistics> => {
  const error = getApiStatisticsFilterError(filter);
  if (error) throw new Error(error);
  const query = new URLSearchParams({ from: filter.from, to: filter.to });
  const result = await request<unknown>(`/admin/statistics/api?${query}`, { signal: requestSignal(signal) });
  if (!isRecord(result) || !isDate(result.from) || !isDate(result.to)
    || !isCount(result.totalCalls) || !isCount(result.errorCalls) || result.errorCalls > result.totalCalls
    || !isDuration(result.averageDurationMs)
    || !Array.isArray(result.daily) || !result.daily.every(isDaily)
    || !Array.isArray(result.endpoints) || !result.endpoints.every(isEndpoint)) {
    throw new Error("API 통계 응답 형식이 올바르지 않습니다.");
  }
  return {
    from: result.from,
    to: result.to,
    totalCalls: result.totalCalls,
    errorCalls: result.errorCalls,
    averageDurationMs: result.averageDurationMs,
    daily: result.daily,
    endpoints: result.endpoints,
  };
};
