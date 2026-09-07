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
