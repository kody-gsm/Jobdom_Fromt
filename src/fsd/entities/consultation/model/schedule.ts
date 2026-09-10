export const CONSULTATION_SCHEDULE = [
  { period: "1교시", startHour: 8, startMinute: 40, time: "08:40 - 09:30" },
  { period: "2교시", startHour: 9, startMinute: 40, time: "09:40 - 10:30" },
  { period: "3교시", startHour: 10, startMinute: 40, time: "10:40 - 11:30" },
  { period: "4교시", startHour: 11, startMinute: 40, time: "11:40 - 12:30" },
  { period: "점심시간", startHour: 12, startMinute: 30, time: "12:30 - 13:30" },
  { period: "5교시", startHour: 13, startMinute: 30, time: "13:30 - 14:20" },
  { period: "6교시", startHour: 14, startMinute: 30, time: "14:30 - 15:20" },
  { period: "7교시", startHour: 15, startMinute: 30, time: "15:30 - 16:20" },
  { period: "8교시", startHour: 16, startMinute: 30, time: "16:30 - 17:20" },
  { period: "저녁시간", startHour: 17, startMinute: 20, time: "17:20 - 18:20" },
  { period: "9교시", startHour: 18, startMinute: 20, time: "18:20 - 19:10" },
] as const;

export const getConsultationScheduleItem = (period: string) =>
  CONSULTATION_SCHEDULE.find((item) => item.period === period) ?? null;
