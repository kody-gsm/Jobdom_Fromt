import type { StudentReservation } from "../../../entities/consultation/index.ts";
import {
  toProfileConsultation,
  type ProfileConsultation,
} from "../../../entities/consultation/index.ts";

interface ProfileSession {
  name?: string;
  email?: string;
}

interface BuildUserProfileInput {
  course: StudentReservation[];
  common: StudentReservation[];
  upcomingCourse: StudentReservation[];
  upcomingCommon: StudentReservation[];
  session: ProfileSession | null;
}

export interface UserProfileData {
  name: string;
  studentId: string;
  reservations: ProfileConsultation[];
  history: ProfileConsultation[];
}

export const buildUserProfileData = ({
  course,
  common,
  upcomingCourse,
  upcomingCommon,
  session,
}: BuildUserProfileInput): UserProfileData => {
  const reservations = [
    ...upcomingCourse.map((item) => toProfileConsultation("course", item)),
    ...upcomingCommon.map((item) => toProfileConsultation("common", item)),
  ];
  const upcomingIds = new Set(reservations.map((item) => item.id));
  const history = [
    ...course.map((item) => toProfileConsultation("course", item)),
    ...common.map((item) => toProfileConsultation("common", item)),
  ].filter((item) => !upcomingIds.has(item.id));

  return {
    name: session?.name || "",
    studentId: session?.email?.split("@")[0] || "",
    reservations,
    history,
  };
};
