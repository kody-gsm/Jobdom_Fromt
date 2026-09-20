import type { ReservationStatus } from "./types.ts";

export type ReservationPresentation = {
  status: ReservationStatus;
  statusLabel: string;
  actionLabel: string;
};

export const getReservationPresentation = (
  status?: ReservationStatus,
): ReservationPresentation => {
  if (status === "WAITING") {
    return { status, statusLabel: "신청 대기", actionLabel: "신청 취소" };
  }
  if (status === "CANCELED") {
    return { status, statusLabel: "취소", actionLabel: "" };
  }
  return { status: "RESERVED", statusLabel: "예약 확정", actionLabel: "예약 취소" };
};

export const isActiveReservation = (status?: ReservationStatus) =>
  status !== "CANCELED";
