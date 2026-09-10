export type {
  ConsultationDate,
  ConsultationDraft,
  ConsultationKind,
  ConsultationTeacher,
  ConsultationType,
  CounselingCategory,
  ReservationInput,
  StudentReservation,
  TeacherReservation,
} from "./model/types.ts";
export {
  TEACHERS,
  createReservationInput,
  getAvailablePeriods,
  getSelectablePeriods,
  getNextAvailableDate,
  getNextWeekdays,
  toConsultationKind,
  toCounselingCategory,
  validateConsultationDraft,
} from "./model/rules.ts";
export { createConsultationApi } from "./api/createConsultationApi.ts";

export type { ProfileConsultation } from "./model/profile.ts";
export { decodeProfileConsultationId, toProfileConsultation } from "./model/profile.ts";
export { isConsultationCancelable, isConsultationUpcoming } from "./model/timePolicy.ts";

export { CONSULTATION_SCHEDULE, getConsultationScheduleItem } from "./model/schedule.ts";
