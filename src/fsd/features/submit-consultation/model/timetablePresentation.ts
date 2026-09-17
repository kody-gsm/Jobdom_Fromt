import type { StudentTimetableItem } from "../api/consultation.ts";

export type { StudentTimetableItem } from "../api/consultation.ts";

export const getTimetableSubject = (
  timetable: StudentTimetableItem[],
  date: string | null,
  period: string,
) => {
  if (!date) return null;
  const item = timetable.find((entry) => entry.date === date && entry.period === period);
  return item?.subject?.trim() || null;
};
