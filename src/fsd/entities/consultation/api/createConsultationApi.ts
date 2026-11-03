import type { ApiRequestInit } from "@fsd/shared/api";
import type {
  ConsultationKind,
  ReservationUpdateInput,
  ReservationInput,
  StudentReservation,
  TeacherReservation,
  TeacherSlotStatus,
} from "../model/types.ts";

interface RequestFn {
  <T>(path: string, init?: ApiRequestInit): Promise<T>;
}

const invalidationPaths = (kind: ConsultationKind) => [`/student/${kind}`, `/teacher/${kind}`];

export const createConsultationApi = (request: RequestFn) => ({
  getUpcoming: (kind: ConsultationKind, init?: Pick<ApiRequestInit, "cache">) =>
    request<StudentReservation[]>(`/student/${kind}`, init),
  getAll: (kind: ConsultationKind) =>
    request<StudentReservation[]>(`/student/${kind}`),
  create: (kind: ConsultationKind, input: ReservationInput) =>
    request<string>(`/student/${kind}`, {
      method: "POST",
      invalidateCache: invalidationPaths(kind),
      body: JSON.stringify(input),
    }),
  update: (kind: ConsultationKind, id: number, input: ReservationUpdateInput) =>
    request<unknown>(`/student/${kind}/${id}`, {
      method: "PATCH",
      invalidateCache: invalidationPaths(kind),
      body: JSON.stringify(input),
    }),
  cancel: (kind: ConsultationKind, id: number) =>
    request<string>(`/student/${kind}/cancel/${id}`, { method: "PATCH", invalidateCache: invalidationPaths(kind) }),
  getTeacher: (kind: ConsultationKind) =>
    request<TeacherReservation[]>(`/teacher/${kind}`),
  getPendingTeacher: (kind: ConsultationKind) =>
    request<TeacherReservation[]>(`/teacher/${kind}/pending`),
  getTeacherSlotStatus: (kind: ConsultationKind, teacherId: number, date: string) => {
    const query = new URLSearchParams({ teacherId: String(teacherId), date });
    return request<TeacherSlotStatus[]>(`/teacher/${kind}/status?${query.toString()}`);
  },
  approve: (kind: ConsultationKind, id: number) =>
    request<string>(`/teacher/${kind}/allow/${id}`, { method: "PATCH", invalidateCache: invalidationPaths(kind) }),
  reject: (kind: ConsultationKind, id: number) =>
    request<string>(`/teacher/${kind}/reject/${id}`, { method: "PATCH", invalidateCache: invalidationPaths(kind) }),
  unlock: (
    kind: ConsultationKind,
    input: Pick<ReservationInput, "date" | "period">,
  ) => request<string>(`/teacher/${kind}/unlock`, {
    method: "POST",
    invalidateCache: invalidationPaths(kind),
    body: JSON.stringify(input),
  }),
  lock: (
    kind: ConsultationKind,
    input: Pick<ReservationInput, "date" | "period">,
  ) => request<string>(`/teacher/${kind}/lock`, {
    method: "POST",
    invalidateCache: invalidationPaths(kind),
    body: JSON.stringify(input),
  }),
});
