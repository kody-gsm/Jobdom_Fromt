export const CONSULTATION_SCHEDULE_ROWS = [
  { period: "1교시", time: "08:40 - 09:30" },
  { period: "2교시", time: "09:40 - 10:30" },
  { period: "3교시", time: "10:40 - 11:30" },
  { period: "4교시", time: "11:40 - 12:30" },
  { period: "점심시간", time: "12:30 - 13:30" },
  { period: "5교시", time: "13:30 - 14:20" },
  { period: "6교시", time: "14:30 - 15:20" },
  { period: "7교시", time: "15:30 - 16:20" },
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
