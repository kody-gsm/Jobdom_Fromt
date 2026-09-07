import type { ConsultationType } from "@fsd/entities/consultation";
import type { ConsultationTeacherOption } from "../api/consultation.ts";

const GENERAL_TEACHER_LABELS = [
  "임경원 선생님",
  "김권예소 선생님",
  "정윤기 선생님",
] as const;

export const getConsultationTeacherLabel = (name: string) =>
  name.endsWith(" 선생님") ? name : `${name} 선생님`;

export const getConsultationTeacherOptions = (
  type: ConsultationType,
  teachers: ConsultationTeacherOption[],
) => {
  if (type === "career") return teachers;

  return GENERAL_TEACHER_LABELS.flatMap((label) => {
    const teacher = teachers.find(
      (item) => getConsultationTeacherLabel(item.name) === label,
    );
    return teacher ? [teacher] : [];
  });
};
