export type {
  ConsultationDate,
  ConsultationDraft,
  ConsultationKind,
  ConsultationTeacher,
  ConsultationType,
  ReservationInput,
  StudentReservation,
} from "./model/types.ts";
export {
  TEACHERS,
  createReservationInput,
  getAvailablePeriods,
  getNextWeekdays,
  toConsultationKind,
  validateConsultationDraft,
} from "./model/rules.ts";
export { createConsultationApi } from "./api/createConsultationApi.ts";

export type { ProfileConsultation } from "./model/profile.ts";
export { decodeProfileConsultationId, toProfileConsultation } from "./model/profile.ts";
