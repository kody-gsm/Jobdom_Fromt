import type { TeacherReservation } from "@fsd/entities/consultation";

type ClassScheduleEntry = {
    label: string; // 예: "2-4" (학년-반), "창체", "취동" 등
    subtitle?: string; // 학년-반 수업일 때만 "수업"으로 표시, 창체/취동 등은 생략
}

// ponytail: 임경원 주간 수업표만 보유. 실제 교사별 시간표 API가 제공되면 교체한다.
export const WEEKLY_CLASS_SCHEDULE: Record<string, Record<string, ClassScheduleEntry>> = {
    "월": {
        "4교시": { label: "3-1", subtitle: "수업" },
    },
    "화": {
        "5교시": { label: "2-2", subtitle: "수업" },
    },
    "수": {
        "1교시": { label: "3-3", subtitle: "수업" },
        "3교시": { label: "3-4", subtitle: "수업" },
        "5교시": { label: "창체" },
        "6교시": { label: "창체" },
        "7교시": { label: "취동" },
    },
    "목": {
        "1교시": { label: "3-4", subtitle: "수업" },
        "5교시": { label: "2-4", subtitle: "수업" },
    },
    "금": {
        "1교시": { label: "2-1", subtitle: "수업" },
        "4교시": { label: "3-2", subtitle: "수업" },
        "7교시": { label: "2-3", subtitle: "수업" },
    },
};


export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getWeek(date: Date) {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return Array.from({ length: 5 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

export function formatPeriod(period: string) {
  return /^\d+$/.test(period) ? `${period}교시` : period;
}

export function reservationSlot(item: Pick<TeacherReservation, "date" | "period">) {
  return `${item.date}_${formatPeriod(item.period)}`;
}
