import {
  getConsultationTeacherLabel,
  type ConsultationType,
} from "@fsd/entities/consultation";
import type { ConsultationTeacherOption } from "../api/consultation.ts";

export { getConsultationTeacherLabel };

export const getConsultationTeacherOptions = (
  _type: ConsultationType,
  teachers: ConsultationTeacherOption[],
) => teachers;
