export type ApiStatisticsFilter = { from: string; to: string };
export type ApiStatisticsDaily = { date: string; calls: number; errorCalls: number };
export type ApiStatisticsEndpoint = {
  method: string;
  route: string;
  status: number;
  calls: number;
  averageDurationMs: number;
};
export type ApiStatistics = {
  from: string;
  to: string;
  totalCalls: number;
  errorCalls: number;
  averageDurationMs: number;
  daily: ApiStatisticsDaily[];
  endpoints: ApiStatisticsEndpoint[];
};

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 366;
const toTime = (date: string) => new Date(`${date}T00:00:00Z`).getTime();

export const isCalendarDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(value);
};

export const getApiStatisticsFilterError = (filter: ApiStatisticsFilter) => {
  if (!isCalendarDate(filter.from) || !isCalendarDate(filter.to)) return "올바른 조회 날짜를 선택해 주세요.";
  if (filter.from > filter.to) return "시작일은 종료일보다 늦을 수 없습니다.";
  if ((toTime(filter.to) - toTime(filter.from)) / DAY_MS >= MAX_RANGE_DAYS) return `조회 기간은 최대 ${MAX_RANGE_DAYS}일까지 선택할 수 있습니다.`;
  return "";
};

export const getDefaultApiStatisticsFilter = (today = new Date()): ApiStatisticsFilter => {
  const koreaTime = today.getTime() + 9 * 60 * 60 * 1000;
  return {
    from: new Date(koreaTime - 29 * DAY_MS).toISOString().slice(0, 10),
    to: new Date(koreaTime).toISOString().slice(0, 10),
  };
};

/** 서버는 호출이 있던 날만 내려주므로 차트용으로 빈 날짜를 0으로 채운다. */
export const fillApiStatisticsDays = (from: string, to: string, daily: ApiStatisticsDaily[]): ApiStatisticsDaily[] => {
  const byDate = new Map(daily.map((day) => [day.date, day]));
  const days: ApiStatisticsDaily[] = [];
  for (let time = toTime(from); time <= toTime(to); time += DAY_MS) {
    const date = new Date(time).toISOString().slice(0, 10);
    days.push(byDate.get(date) ?? { date, calls: 0, errorCalls: 0 });
  }
  return days;
};

export const getErrorRate = (calls: number, errorCalls: number) =>
  calls === 0 ? 0 : Math.round((errorCalls / calls) * 1000) / 10;
