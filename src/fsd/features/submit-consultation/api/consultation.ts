import type {
  ConsultationKind,
  ReservationInput,
} from "@fsd/entities/consultation";
import { requestWithSession } from "@fsd/entities/user";

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
};

export const getConsultationTeachers = () =>
  requestWithSession<ConsultationTeacherOption[]>("/api/teachers");

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
