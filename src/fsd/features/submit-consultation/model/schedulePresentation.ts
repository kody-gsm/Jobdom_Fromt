import { CONSULTATION_SCHEDULE } from "@fsd/entities/consultation";

export const CONSULTATION_SCHEDULE_ROWS = CONSULTATION_SCHEDULE;

const PERIOD_TIMES = Object.fromEntries(
  CONSULTATION_SCHEDULE.map(({ period, time }) => [period, time]),
) as Record<string, string>;

const WEEKDAYS = ["일 (Sun)", "월 (Mon)", "화 (Tue)", "수 (Wed)", "목 (Thu)", "금 (Fri)", "토 (Sat)"];

export const getConsultationPeriodTime = (period: string) => PERIOD_TIMES[period] ?? null;

export const getConsultationWeekdayLabel = (date: string) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  return WEEKDAYS[day] ?? "";
};
