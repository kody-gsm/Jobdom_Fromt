export type ConsultationType = "career" | "general";
export type ConsultationKind = "course" | "common";
export type ConsultationTeacher =
  | "임경원 선생님"
  | "김권예소 선생님"
  | "정윤기 선생님";

export interface ConsultationDraft {
  type: ConsultationType;
  title: string;
  content: string;
  teacher: ConsultationTeacher | null;
  date: string | null;
  period: string | null;
}

export interface ReservationInput {
  title: string;
  content: string;
  date: string;
  period: string;
}

export interface StudentReservation {
  id: number;
  name: string;
  date: string;
  period: string;
}
export interface ConsultationDate {
  day: string;
  date: number;
  value: string;
}
