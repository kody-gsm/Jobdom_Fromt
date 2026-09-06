import type {
  ConsultationKind,
  ReservationInput,
} from "@fsd/entities/consultation";
import { requestWithSession } from "@fsd/entities/user";

export type ConsultationTeacherOption = {
  id: number;
  name: string;
};

export type SubmitConsultationInput = ReservationInput & {
  teacherId: number;
};

export const getConsultationTeachers = () =>
  requestWithSession<ConsultationTeacherOption[]>("/student/teachers");

export const submitConsultation = (
  kind: ConsultationKind,
  input: SubmitConsultationInput,
) => requestWithSession<string>(`/student/${kind}`, {
  method: "POST",
  body: JSON.stringify(input),
});
