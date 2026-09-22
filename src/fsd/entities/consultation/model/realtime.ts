import type { ReservationStatus } from "./types.ts";

export const RESERVATION_CHANGED_EVENT = "jobdam:reservation-changed";

export type ReservationRealtimeEvent = {
  counselingType: "COURSE" | "COMMON";
  action: string;
  reservationId: number;
  date: string;
  period: string;
  status: ReservationStatus;
  teacherId: number | null;
  studentId: number | null;
};

const isReservationStatus = (value: unknown): value is ReservationStatus =>
  value === "WAITING" || value === "RESERVED" || value === "CANCELED";

export const isReservationRealtimeEvent = (
  value: unknown,
): value is ReservationRealtimeEvent => {
  if (!value || typeof value !== "object") return false;
  const event = value as Record<string, unknown>;
  return (
    (event.counselingType === "COURSE" || event.counselingType === "COMMON") &&
    typeof event.action === "string" &&
    typeof event.reservationId === "number" &&
    typeof event.date === "string" &&
    typeof event.period === "string" &&
    isReservationStatus(event.status) &&
    (typeof event.teacherId === "number" || event.teacherId === null) &&
    (typeof event.studentId === "number" || event.studentId === null)
  );
};
