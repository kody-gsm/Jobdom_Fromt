const PERIOD_STARTS: Record<string, [number, number]> = {
  "1교시": [8, 40],
  "2교시": [9, 40],
  "3교시": [10, 40],
  "4교시": [11, 40],
  "점심시간": [12, 30],
  "5교시": [13, 30],
  "6교시": [14, 30],
  "7교시": [15, 30],
};

const getStartTimestamp = (date: string, period: string) => {
  const [hour, minute] = PERIOD_STARTS[period] ?? [];
  const [year, month, day] = date.replaceAll(".", "-").split("-").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  return Date.UTC(year, month - 1, day, hour - 9, minute);
};

export const isConsultationUpcoming = (date: string, period: string, now = new Date()) => {
  const start = getStartTimestamp(date, period);
  return start !== null && now.getTime() < start;
};

export const isConsultationCancelable = (date: string, period: string, now = new Date()) => {
  const start = getStartTimestamp(date, period);
  return start !== null && now.getTime() < start - 60 * 60 * 1000;
};