import type {
  ConsultationKind,
  ReservationInput,
  StudentReservation,
  TeacherReservation,
} from "../model/types.ts";

interface RequestFn {
  <T>(path: string, init?: RequestInit): Promise<T>;
}

export const createConsultationApi = (request: RequestFn) => ({
  getUpcoming: (kind: ConsultationKind) =>
    request<StudentReservation[]>(`/student/${kind}`),
  getAll: (kind: ConsultationKind) =>
    request<StudentReservation[]>(`/student/${kind}`),
  create: (kind: ConsultationKind, input: ReservationInput) =>
    request<string>(`/student/${kind}`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  cancel: (kind: ConsultationKind, id: number) =>
    request<string>(`/student/${kind}/cancel/${id}`, { method: "PATCH" }),
  getTeacher: (kind: ConsultationKind) =>
    request<TeacherReservation[]>(`/teacher/${kind}`),
  approve: (kind: ConsultationKind, id: number) =>
    request<string>(`/teacher/${kind}/allow/${id}`, { method: "PATCH" }),
  lock: (
    kind: ConsultationKind,
    input: Pick<ReservationInput, "date" | "period">,
  ) => request<string>(`/teacher/${kind}/lock`, {
    method: "POST",
    body: JSON.stringify(input),
  }),
});
