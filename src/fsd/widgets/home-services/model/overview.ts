import type { Recruit } from "@fsd/entities/recruit";
import {
  getReservationPresentation,
  type ReservationStatus,
  type StudentReservation,
} from "@fsd/entities/consultation";

export type HomeConsultationItem = {
  id: number;
  type: "진로상담" | "일반상담";
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
      .filter((item) => item.status !== "CANCELED")
      .map((item) => toHomeConsultationItem("course", item)),
    ...common
      .filter((item) => item.status !== "CANCELED")
      .map((item) => toHomeConsultationItem("common", item)),
  ].sort((a, b) => `${a.date} ${a.period}`.localeCompare(`${b.date} ${b.period}`)),
  recentRecruits: recruits
    .filter((item) => item.status === "PUBLISHED")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 2),
});
