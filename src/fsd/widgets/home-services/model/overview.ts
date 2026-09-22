import type { Recruit } from "../../../entities/recruit/model/types.ts";
import { getConsultationTeacherLabel } from "../../../entities/consultation/model/labels.ts";
import { getReservationPresentation, isActiveReservation } from "../../../entities/consultation/model/status.ts";
import type { ReservationStatus, StudentReservation } from "../../../entities/consultation/model/types.ts";

export type HomeConsultationItem = {
  id: number;
  type: "진로상담" | "일반상담";
  teacherName: string;
  date: string;
  period: string;
  status: ReservationStatus;
  statusLabel: string;
  actionLabel: string;
};

export type HomeOverview = {
  upcomingConsultations: HomeConsultationItem[];
  recentRecruits: Recruit[];
};

const toHomeConsultationItem = (
  kind: "course" | "common",
  item: StudentReservation,
): HomeConsultationItem => ({
  id: item.id * 2 + (kind === "common" ? 1 : 0),
  type: kind === "course" ? "진로상담" : "일반상담",
  teacherName: getConsultationTeacherLabel(item.teacherName),
  date: item.date,
  period: item.period,
  ...getReservationPresentation(item.status),
});

export const buildHomeOverview = ({
  course,
  common,
  recruits,
}: {
  course: StudentReservation[];
  common: StudentReservation[];
  recruits: Recruit[];
}): HomeOverview => ({
  upcomingConsultations: [
    ...course
      .filter((item) => isActiveReservation(item.status))
      .map((item) => toHomeConsultationItem("course", item)),
    ...common
      .filter((item) => isActiveReservation(item.status))
      .map((item) => toHomeConsultationItem("common", item)),
  ].sort((a, b) => `${a.date} ${a.period}`.localeCompare(`${b.date} ${b.period}`)),
  recentRecruits: recruits
    .filter((item) => item.status === "PUBLISHED")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 2),
});

export const replaceHomeConsultations = (
  current: HomeOverview,
  course: StudentReservation[],
  common: StudentReservation[],
): HomeOverview => ({
  ...current,
  upcomingConsultations: buildHomeOverview({
    course,
    common,
    recruits: [],
  }).upcomingConsultations,
});
