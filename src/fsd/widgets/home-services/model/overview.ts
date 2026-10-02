import type { Recruit } from "@fsd/entities/recruit";
import {
  decodeProfileConsultationId,
  getReservationPresentation,
  isActiveReservation,
  CONSULTATION_SCHEDULE,
  toConsultationDetailItem,
  type ConsultationDetailItem,
  type ReservationStatus,
  type StudentReservation,
} from "@fsd/entities/consultation";

export type HomeConsultationItem = ConsultationDetailItem & {
  status: ReservationStatus;
  statusLabel: string;
  actionLabel: string;
};

export type HomeOverview = {
  upcomingConsultations: HomeConsultationItem[];
  recentRecruits: Recruit[];
};

const getConsultationStartMinutes = (period: string) => {
  const schedule = CONSULTATION_SCHEDULE.find((item) => item.period === period);
  return schedule === undefined
    ? Number.MAX_SAFE_INTEGER
    : schedule.startHour * 60 + schedule.startMinute;
};

const compareConsultationSchedule = (left: HomeConsultationItem, right: HomeConsultationItem) => {
  const dateOrder = left.date.localeCompare(right.date);
  if (dateOrder !== 0) return dateOrder;

  const periodOrder = getConsultationStartMinutes(left.period) - getConsultationStartMinutes(right.period);
  return periodOrder !== 0 ? periodOrder : left.period.localeCompare(right.period);
};

const toHomeConsultationItem = (
  kind: "course" | "common",
  item: StudentReservation,
): HomeConsultationItem => ({
  ...toConsultationDetailItem(kind, item),
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
  ].sort(compareConsultationSchedule),
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

export const removeHomeReservationFromCache = (
  cache: {
    course: StudentReservation[];
    common: StudentReservation[];
  },
  homeId: number,
) => {
  const { kind, reservationId } = decodeProfileConsultationId(homeId);

  return {
    course: kind === "course"
      ? cache.course.filter((item) => item.id !== reservationId)
      : cache.course,
    common: kind === "common"
      ? cache.common.filter((item) => item.id !== reservationId)
      : cache.common,
  };
};
