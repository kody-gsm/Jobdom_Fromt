import type {
  ConsultationKind,
  ReservationInput,
  StudentReservation,
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
});
