import {
  ConsultationKind,
  cancelConsultation,
  getSession,
  getStudentConsultations,
  getUpcomingConsultations,
} from "@/app/utils/api";

export interface Consultation {
  id: number;
  type: string;
  date: string;
  slot: string;
  counselor?: string;
  counselorComment?: string;
  myMemo?: string;
}

export interface UserProfileData {
  name: string;
  studentId: string;
  reservations: Consultation[];
  history: Consultation[];
}

const key = (kind: ConsultationKind, id: number) => id * 2 + (kind === "common" ? 1 : 0);
const map = (kind: ConsultationKind, items: { id: number; date: string; period: string }[]): Consultation[] =>
  items.map((item) => ({
    id: key(kind, item.id),
    type: kind === "course" ? "진로상담" : "일반상담",
    date: item.date.replaceAll("-", "."),
    slot: item.period,
  }));

export const fetchUserProfile = async (): Promise<UserProfileData> => {
  const [course, common, upcomingCourse, upcomingCommon] = await Promise.all([
    getStudentConsultations("course"),
    getStudentConsultations("common"),
    getUpcomingConsultations("course"),
    getUpcomingConsultations("common"),
  ]);
  const reservations = [...map("course", upcomingCourse), ...map("common", upcomingCommon)];
  const upcoming = new Set(reservations.map((item) => item.id));
  const history = [...map("course", course), ...map("common", common)].filter((item) => !upcoming.has(item.id));
  const session = getSession();
  return {
    name: session?.name || "",
    studentId: session?.email.split("@")[0] || "",
    reservations,
    history,
  };
};

export const deleteReservation = (id: number) =>
  cancelConsultation(id % 2 === 1 ? "common" : "course", Math.floor(id / 2));
