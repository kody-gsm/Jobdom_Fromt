import type {
  ConsultationTeacher,
  ConsultationType,
} from "@fsd/entities/consultation";
import type { ConsultationTeacherOption } from "../api/consultation.ts";

const GENERAL_TEACHER_LABELS = [
  "임경원 선생님",
  "김권예소 선생님",
  "정윤기 선생님",
] as const;

export const getConsultationTeacherLabel = (
  name: string,
): ConsultationTeacher => (
  name.endsWith(" 선생님") ? name : `${name} 선생님`
) as ConsultationTeacher;

export const getConsultationTeacherOptions = (
  type: ConsultationType,
  teachers: ConsultationTeacherOption[],
) => {
  if (type !== "general") return teachers;

  const optionsByLabel = new Map(
    teachers.map((teacher) => [getConsultationTeacherLabel(teacher.name), teacher]),
  );
  return GENERAL_TEACHER_LABELS.flatMap((label) => {
    const option = optionsByLabel.get(label);
    return option ? [option] : [];
  });
};