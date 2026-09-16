import type { ConsultationType } from "@fsd/entities/consultation";
import type { ConsultationTeacherOption } from "../api/consultation.ts";

export const getConsultationTeacherLabel = (name: string) =>
  name.endsWith(" 선생님") ? name : `${name} 선생님`;

export const getConsultationTeacherOptions = (
  _type: ConsultationType,
  teachers: ConsultationTeacherOption[],
) => teachers;
