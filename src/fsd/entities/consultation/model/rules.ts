import type {
  ConsultationDate,
  ConsultationDraft,
  ConsultationKind,
  ConsultationTeacher,
  ConsultationType,
  CounselingCategory,
  ReservationInput,
} from "./types.ts";
import { CONSULTATION_SCHEDULE } from "./schedule.ts";

const KOREA_TIME_ZONE = "Asia/Seoul";

export const TEACHERS: ConsultationTeacher[] = [
  "임경원 선생님",
  "김권예소 선생님",
  "정윤기 선생님",
];

const BLOCKED_GENERAL_PERIODS = new Set(["4교시"]);
const GENERAL_END_PERIODS = new Set(["8교시", "9교시", "저녁시간"]);
const GENERAL_PERIODS = CONSULTATION_SCHEDULE
  .map(({ period }) => period)
  .filter((period) =>
    !BLOCKED_GENERAL_PERIODS.has(period) && !GENERAL_END_PERIODS.has(period),
  );

export const toConsultationKind = (type: ConsultationType): ConsultationKind =>
  type === "career" ? "course" : "common";

export const toCounselingCategory = (
  type: ConsultationType,
): CounselingCategory => type === "career" ? "취업" : "기타";

export const getAvailablePeriods = (
  type: ConsultationType,
  teacher: ConsultationTeacher | null,
): string[] => {
  if (type === "general") return GENERAL_PERIODS;
  if (!teacher) return [];
  // Career teachers are supplied by the backend by role. Keep every slot in
  // the shared schedule; reservations/locks are applied through the status API.
  return CONSULTATION_SCHEDULE.map(({ period }) => period);
};

const getKoreaClock = (now: Date) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KOREA_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return {
    weekday: getPart("weekday"),
    hour: Number(getPart("hour")),
    minute: Number(getPart("minute")),
  };
};

export const getSelectablePeriods = (
  type: ConsultationType,
  teacher: ConsultationTeacher | null,
  now = new Date(),
) => {
  const periods = getAvailablePeriods(type, teacher);
  const { weekday, hour, minute } = getKoreaClock(now);
  if (weekday === "Sun" || weekday === "Sat") return periods;
  return periods.filter((period) => {
    const schedule = CONSULTATION_SCHEDULE.find((item) => item.period === period);
    return schedule !== undefined &&
      (schedule.startHour > hour ||
        (schedule.startHour === hour && schedule.startMinute > minute));
  });
};

const getKoreaDateValue = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: KOREA_TIME_ZONE }).format(date);

const addDateValue = (dateValue: string, days: number) => {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const getDateWeekday = (dateValue: string) =>
  new Date(`${dateValue}T00:00:00Z`).getUTCDay();

const getNextAvailableDateWithBlockedDates = (
  date: string,
  now: Date,
  blockedDates: ReadonlySet<string> = new Set(),
) => {
  const today = getKoreaDateValue(now);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: KOREA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const baseDate = date > today ? date : today;
  const isWeekday = getDateWeekday(baseDate) !== 0 && getDateWeekday(baseDate) !== 6;
  if (
    isWeekday &&
    !blockedDates.has(baseDate) &&
    (baseDate > today || time < "19:30")
  ) return baseDate;

  let next = addDateValue(baseDate, 1);
  while (
    getDateWeekday(next) === 0 ||
    getDateWeekday(next) === 6 ||
    blockedDates.has(next)
  ) {
    next = addDateValue(next, 1);
  }
  return next;
};

export const getNextAvailableDate = (
  date: string,
  now = new Date(),
  blockedDates: ReadonlySet<string> = new Set(),
) => getNextAvailableDateWithBlockedDates(date, now, blockedDates);

export const getSelectableConsultationDates = (
  dates: ConsultationDate[],
  now = new Date(),
  blockedDates: ReadonlySet<string> = new Set(),
) => dates.filter(({ value }) =>
  !blockedDates.has(value) &&
  getNextAvailableDateWithBlockedDates(value, now, blockedDates) === value,
);

export const getNextWeekdays = (
  start = new Date(),
  days = 31,
): ConsultationDate[] => {
  const result: ConsultationDate[] = [];
  const startValue = getKoreaDateValue(start);
  const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

  for (let offset = 0; offset < days; offset += 1) {
    const value = addDateValue(startValue, offset);
    const weekday = getDateWeekday(value);
    if (weekday !== 0 && weekday !== 6) {
      result.push({
        day: dayLabels[weekday] ?? "",
        date: Number(value.slice(-2)),
        value,
      });
    }
  }
  return result;
};
export const validateConsultationDraft = (
  draft: ConsultationDraft,
  hasCareerReservation: boolean,
): string | null => {
  if (!draft.title.trim()) return "제목을 입력해주세요";
  if (!draft.content.trim()) return "내용을 입력해주세요";
  if (draft.type === "career" && !draft.teacher) return "선생님을 선택해주세요";
  if (!draft.date) return "날짜를 선택해주세요";
  if (!draft.period) return "교시를 선택해주세요";
  if (draft.type === "career" && hasCareerReservation) {
    return "진로 상담은 중복 신청할 수 없습니다";
  }
  return null;
};

export const createReservationInput = (
  draft: ConsultationDraft,
): ReservationInput => ({
  title: draft.title.trim(),
  content: draft.content.trim(),
  category: toCounselingCategory(draft.type),
  date: draft.date ?? "",
  period: draft.period ?? "",
});
