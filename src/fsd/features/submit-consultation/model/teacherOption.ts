import type { ConsultationType } from "@fsd/entities/consultation";
import { getConsultationTeacherLabel } from "../../../entities/consultation/model/labels.ts";
import type { ConsultationTeacherOption } from "../api/consultation.ts";

export { getConsultationTeacherLabel };

export const getConsultationTeacherOptions = (
  _type: ConsultationType,
  teachers: ConsultationTeacherOption[],
) => teachers;
