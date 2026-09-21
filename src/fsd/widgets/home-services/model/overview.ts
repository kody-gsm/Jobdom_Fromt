import type { Recruit } from "../../../entities/recruit/index.ts";
import {
  getReservationPresentation,
  isActiveReservation,
  type ReservationStatus,
  type StudentReservation,
} from "../../../entities/consultation/index.ts";

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
  teacherName: item.teacherName,
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
