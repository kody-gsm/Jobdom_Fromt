import type {
  ConsultationKind,
  ReservationInput,
} from "@fsd/entities/consultation";
import { requestWithSession } from "@fsd/entities/user";

export type StudentTimetableItem = {
  dayOfWeek?: string | number;
  day?: string | number;
  period?: string | number;
  subjectName?: string | null;
  subject?: string | null;
  name?: string | null;
};

export type ConsultationTeacherOption = {
  id: number;
  name: string;
};

export type ConsultationSlotStatus = {
  teacherId: number;
  date: string;
  period: string;
  state: "CANCEL" | "WAITING" | "RESERVED" | "LOCKED" | "AUTO";
  available: boolean;
};

export type SubmitConsultationInput = ReservationInput & {
  teacherId: number;
  category: string;
  otherCategory?: string;
};

export const getConsultationTeachers = (kind: ConsultationKind) =>
  requestWithSession<ConsultationTeacherOption[]>(`/student/${kind}/teachers`);

export const getStudentTimetable = () =>
  requestWithSession<StudentTimetableItem[]>("/student/timetable");

export const getConsultationSlotStatus = (
  kind: ConsultationKind,
  teacherId: number,
  date: string,
) => {
  const query = new URLSearchParams({
    teacherId: String(teacherId),
    date,
  });
  return requestWithSession<ConsultationSlotStatus[]>(
    `/student/${kind}/status?${query.toString()}`,
  );
};

export const submitConsultation = (
  kind: ConsultationKind,
  input: SubmitConsultationInput,
) => requestWithSession<string>(`/student/${kind}`, {
  method: "POST",
  body: JSON.stringify(input),
});
