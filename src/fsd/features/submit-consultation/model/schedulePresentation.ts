import { CONSULTATION_SCHEDULE } from "@fsd/entities/consultation";

const STUDENT_CONSULTATION_PERIODS = new Set([
  ...Array.from({ length: 7 }, (_, index) => `${index + 1}교시`),
  "점심시간",
]);

export const CONSULTATION_SCHEDULE_ROWS = CONSULTATION_SCHEDULE.filter(({ period }) =>
  STUDENT_CONSULTATION_PERIODS.has(period),
);

const PERIOD_TIMES = Object.fromEntries(
  CONSULTATION_SCHEDULE.map(({ period, time }) => [period, time]),
) as Record<string, string>;

const WEEKDAYS = ["일 (Sun)", "월 (Mon)", "화 (Tue)", "수 (Wed)", "목 (Thu)", "금 (Fri)", "토 (Sat)"];

export const getConsultationPeriodTime = (period: string) => PERIOD_TIMES[period] ?? null;

export const getConsultationWeekdayLabel = (date: string) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  return WEEKDAYS[day] ?? "";
};
