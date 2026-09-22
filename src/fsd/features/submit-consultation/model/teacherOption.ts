import {
  getConsultationTeacherLabel,
  type ConsultationType,
} from "../../../entities/consultation/index.ts";
import type { ConsultationTeacherOption } from "../api/consultation.ts";

export { getConsultationTeacherLabel };

export const getConsultationTeacherOptions = (
  _type: ConsultationType,
  teachers: ConsultationTeacherOption[],
) => teachers;
