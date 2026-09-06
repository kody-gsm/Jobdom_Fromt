import type { ConsultationTeacher } from "@fsd/entities/consultation";

export const getConsultationTeacherLabel = (
  name: string,
): ConsultationTeacher => (
  name.endsWith(" 선생님") ? name : `${name} 선생님`
) as ConsultationTeacher;
