import type {
  CounselingCategory,
  ConsultationKind,
  ReservationStatus,
  ReservationUpdateInput,
  StudentReservation,
} from "./types.ts";
import { getConsultationTeacherLabel } from "./labels.ts";

export interface ConsultationDetailItem {
  id: number;
  reservationId: number;
  kind: ConsultationKind;
  type: string;
  teacherId: number | null;
  teacherName: string;
  title: string;
  content: string;
  category: CounselingCategory | null;
  date: string;
  period: string;
  status: ReservationStatus;
}

export const toConsultationDetailItem = (
  kind: ConsultationKind,
  item: StudentReservation,
): ConsultationDetailItem => ({
  id: item.id * 2 + (kind === "common" ? 1 : 0),
  reservationId: item.id,
  kind,
  type: kind === "course" ? "진로상담" : "일반상담",
  teacherId: item.teacherId ?? null,
  teacherName: getConsultationTeacherLabel(item.teacherName ?? "선생님"),
  title: item.title ?? "",
  content: item.content ?? "",
  category: item.category ?? null,
  date: item.date,
  period: item.period,
  status: item.status,
});

export const canEditConsultation = (status: ReservationStatus) =>
  status === "WAITING";

export const toConsultationUpdateInput = ({
  title,
  content,
  category,
  date,
  period,
  teacherId,
}: {
  title: string;
  content: string;
  category: CounselingCategory;
  date: string;
  period: string;
  teacherId: number;
}): ReservationUpdateInput => ({
  title: title.trim(),
  content: content.trim(),
  category,
  date,
  period,
  teacherId,
});
