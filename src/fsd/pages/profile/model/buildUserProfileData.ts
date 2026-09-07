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
  upcomingCourse: StudentReservation[];
  upcomingCommon: StudentReservation[];
  session: ProfileSession | null;
}

export interface UserProfileData {
  name: string;
  studentId: string;
  reservations: ProfileConsultation[];
}

export const buildUserProfileData = ({
  upcomingCourse,
  upcomingCommon,
  session,
}: BuildUserProfileInput): UserProfileData => ({
  name: session?.name || "",
  studentId: session?.email?.split("@")[0] || "",
  reservations: [
    ...upcomingCourse.map((item) => toProfileConsultation("course", item)),
    ...upcomingCommon.map((item) => toProfileConsultation("common", item)),
  ],
});