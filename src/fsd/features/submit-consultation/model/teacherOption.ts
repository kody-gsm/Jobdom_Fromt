import type { ConsultationType } from "@fsd/entities/consultation";
import type { ConsultationTeacherOption } from "../api/consultation.ts";

export const getConsultationTeacherLabel = (name: string) =>
  name.endsWith(" 선생님") ? name : `${name} 선생님`;

export const getDefaultGeneralTeacher = (
  teachers: ConsultationTeacherOption[],
): ConsultationTeacherOption | null =>
  teachers.find(
    (teacher) => getConsultationTeacherLabel(teacher.name) === "임경원 선생님",
  ) ?? teachers[0] ?? null;

export const getConsultationTeacherOptions = (
  type: ConsultationType,
  teachers: ConsultationTeacherOption[],
) => type === "career" ? teachers : [];
