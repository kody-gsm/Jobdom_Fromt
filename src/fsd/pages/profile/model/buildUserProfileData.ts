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
  profile: { name: string; email: string; student_number: string };
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
  profile,
}: BuildUserProfileInput): UserProfileData => ({
  name: profile.name || session?.name || "",
  studentId: profile.student_number || session?.email?.split("@")[0] || "",
  reservations: [
    ...upcomingCourse.map((item) => toProfileConsultation("course", item)),
    ...upcomingCommon.map((item) => toProfileConsultation("common", item)),
  ],
});
