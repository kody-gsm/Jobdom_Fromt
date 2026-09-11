import type { ConsultationType } from "@fsd/entities/consultation";
import type { ConsultationTeacherOption } from "../api/consultation.ts";

const CAREER_TEACHER_LABELS = new Set([
  "임경원 선생님",
  "김권예소 선생님",
  "정윤기 선생님",
]);

export const getConsultationTeacherLabel = (name: string) =>
  name.endsWith(" 선생님") ? name : `${name} 선생님`;

export const getConsultationTeacherOptions = (
  type: ConsultationType,
  teachers: ConsultationTeacherOption[],
) => teachers.filter((teacher) =>
  CAREER_TEACHER_LABELS.has(getConsultationTeacherLabel(teacher.name)) ===
    (type === "career"),
);
