import type {
  ConsultationKind,
  ReservationInput,
  StudentReservation,
  TeacherReservation,
  TeacherSlotStatus,
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
  getPendingTeacher: (kind: ConsultationKind) =>
    request<TeacherReservation[]>(`/teacher/${kind}/pending`),
  getTeacherSlotStatus: (kind: ConsultationKind, teacherId: number, date: string) => {
    const query = new URLSearchParams({ teacherId: String(teacherId), date });
    return request<TeacherSlotStatus[]>(`/teacher/${kind}/status?${query.toString()}`);
  },
  approve: (kind: ConsultationKind, id: number) =>
    request<string>(`/teacher/${kind}/allow/${id}`, { method: "PATCH" }),
  reject: (kind: ConsultationKind, id: number) =>
    request<string>(`/teacher/${kind}/reject/${id}`, { method: "PATCH" }),
  unlock: (
    kind: ConsultationKind,
    input: Pick<ReservationInput, "date" | "period">,
  ) => request<string>(`/teacher/${kind}/unlock`, {
    method: "POST",
    body: JSON.stringify(input),
  }),
  lock: (
    kind: ConsultationKind,
    input: Pick<ReservationInput, "date" | "period">,
  ) => request<string>(`/teacher/${kind}/lock`, {
    method: "POST",
    body: JSON.stringify(input),
  }),
});
