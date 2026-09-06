const PERIOD_TIMES: Record<string, string> = {
  "1교시": "09:00 - 09:50",
  "2교시": "10:00 - 10:50",
  "3교시": "11:00 - 11:50",
  "4교시": "12:00 - 12:50",
  "점심시간": "12:50 - 13:50",
  "5교시": "14:00 - 14:50",
  "6교시": "15:00 - 15:50",
  "7교시": "16:00 - 16:50",
};

const WEEKDAYS = ["일 (Sun)", "월 (Mon)", "화 (Tue)", "수 (Wed)", "목 (Thu)", "금 (Fri)", "토 (Sat)"];

export const getConsultationPeriodTime = (period: string) =>
  PERIOD_TIMES[period] ?? null;

export const getConsultationWeekdayLabel = (date: string) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  return WEEKDAYS[day] ?? "";
};
