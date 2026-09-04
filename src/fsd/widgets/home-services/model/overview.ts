import type { Recruit } from "@fsd/entities/recruit";
import type { StudentReservation } from "@fsd/entities/consultation";

export type HomeConsultationItem = {
  id: number;
  type: "진로상담" | "일반상담";
  date: string;
  period: string;
};

export type HomeOverview = {
  upcomingConsultations: HomeConsultationItem[];
  recentRecruits: Recruit[];
};

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
    ...course.map((item) => ({
      id: item.id * 2,
      type: "진로상담" as const,
      date: item.date,
      period: item.period,
    })),
    ...common.map((item) => ({
      id: item.id * 2 + 1,
      type: "일반상담" as const,
      date: item.date,
      period: item.period,
    })),
  ]
    .sort((a, b) => `${a.date} ${a.period}`.localeCompare(`${b.date} ${b.period}`))
    .slice(0, 3),
  recentRecruits: recruits
    .filter((item) => item.status === "PUBLISHED")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 2),
});
