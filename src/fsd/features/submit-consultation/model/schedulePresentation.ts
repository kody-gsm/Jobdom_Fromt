export const CONSULTATION_SCHEDULE_ROWS = [
  { period: "1교시", time: "09:00 - 09:50" },
  { period: "2교시", time: "10:00 - 10:50" },
  { period: "3교시", time: "11:00 - 11:50" },
  { period: "4교시", time: "12:00 - 12:50" },
  { period: "점심시간", time: "12:50 - 13:50", breakTime: true },
  { period: "5교시", time: "14:00 - 14:50" },
  { period: "6교시", time: "15:00 - 15:50" },
  { period: "7교시", time: "16:00 - 16:50" },
] as const;

const PERIOD_TIMES = Object.fromEntries(
  CONSULTATION_SCHEDULE_ROWS.map(({ period, time }) => [period, time]),
) as Record<string, string>;

const WEEKDAYS = ["일 (Sun)", "월 (Mon)", "화 (Tue)", "수 (Wed)", "목 (Thu)", "금 (Fri)", "토 (Sat)"];

export const getConsultationPeriodTime = (period: string) => PERIOD_TIMES[period] ?? null;

export const getConsultationWeekdayLabel = (date: string) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  return WEEKDAYS[day] ?? "";
};
