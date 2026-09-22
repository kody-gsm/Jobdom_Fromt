import { getConsultationScheduleItem } from "./schedule.ts";

const getStartTimestamp = (date: string, period: string) => {
  const schedule = getConsultationScheduleItem(period);
  const [year, month, day] = date.replaceAll(".", "-").split("-").map(Number);
  if (!schedule || ![year, month, day].every(Number.isFinite)) return null;
  return Date.UTC(
    year,
    month - 1,
    day,
    schedule.startHour - 9,
    schedule.startMinute,
  );
};

export const isConsultationUpcoming = (date: string, period: string, now = new Date()) => {
  const start = getStartTimestamp(date, period);
  return start !== null && now.getTime() < start;
};

export const isConsultationCancelable = (date: string, period: string, now = new Date()) => {
  const start = getStartTimestamp(date, period);
  return start !== null && now.getTime() < start - 60 * 60 * 1000;
};

export const getConsultationCancelError = (
  date: string,
  period: string,
  now = new Date(),
) => isConsultationCancelable(date, period, now)
  ? null
  : "상담 시작 1시간 전부터는 취소할 수 없습니다.";
