export type StudentTimetableItem = {
  dayOfWeek?: string | number;
  day?: string | number;
  period?: string | number;
  subjectName?: string | null;
  subject?: string | null;
  name?: string | null;
};

const WEEKDAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const KOREAN_WEEKDAY_NAMES = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

const normalizeDay = (value: string | number | undefined) => {
  if (typeof value === "number") return value >= 1 && value <= 7 ? value % 7 : value;
  const normalized = value?.trim().toUpperCase();
  const index = WEEKDAY_NAMES.findIndex((day, dayIndex) =>
    day === normalized || day.slice(0, 3) === normalized || KOREAN_WEEKDAY_NAMES[dayIndex] === value?.trim(),
  );
  return index;
};

const normalizePeriod = (value: string | number | undefined) =>
  typeof value === "number" ? `${value}교시` : value?.trim() ?? "";

export const getTimetableSubject = (
  timetable: StudentTimetableItem[],
  date: string | null,
  period: string,
) => {
  if (!date) return null;
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  const item = timetable.find((entry) => {
    const day = entry.dayOfWeek ?? entry.day;
    return normalizeDay(day) === weekday && normalizePeriod(entry.period) === period;
  });
  return item?.subjectName?.trim() || item?.subject?.trim() || item?.name?.trim() || null;
};
