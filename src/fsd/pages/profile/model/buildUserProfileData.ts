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
  profile: { name: string; email: string; student_number: string; profileImageUrl?: string };
}

export interface UserProfileData {
  name: string;
  studentId: string;
  avatarUrl: string;
  reservations: ProfileConsultation[];
}

export const formatStudentNumber = (value: string) => {
  const parts = value.match(/\d+/g) ?? [];
  if (parts.length === 3) {
    return `${Number(parts[0])}학년 ${Number(parts[1])}반 ${Number(parts[2])}번`;
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length === 4) {
    return `${Number(digits[0])}학년 ${Number(digits[1])}반 ${Number(digits.slice(2))}번`;
  }

  return value;
};

export const buildUserProfileData = ({
  upcomingCourse,
  upcomingCommon,
  session,
  profile,
}: BuildUserProfileInput): UserProfileData => ({
  name: profile.name || session?.name || "",
  studentId: formatStudentNumber(
    profile.student_number || session?.email?.split("@")[0] || "",
  ),
  avatarUrl: profile.profileImageUrl || "",
  reservations: [
    ...upcomingCourse.map((item) => toProfileConsultation("course", item)),
    ...upcomingCommon.map((item) => toProfileConsultation("common", item)),
  ],
});
