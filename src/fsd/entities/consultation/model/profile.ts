import type {
  ConsultationKind,
  StudentReservation,
} from "./types.ts";

export interface ProfileConsultation {
  id: number;
  type: string;
  date: string;
  slot: string;
  counselor?: string;
  counselorComment?: string;
  myMemo?: string;
}

export const toProfileConsultation = (
  kind: ConsultationKind,
  item: StudentReservation,
): ProfileConsultation => ({
  id: item.id * 2 + (kind === "common" ? 1 : 0),
  type: kind === "course" ? "진로상담" : "일반상담",
  date: item.date.replaceAll("-", "."),
  slot: item.period,
});

export const decodeProfileConsultationId = (profileId: number) => ({
  kind: profileId % 2 === 1 ? ("common" as const) : ("course" as const),
  reservationId: Math.floor(profileId / 2),
});
