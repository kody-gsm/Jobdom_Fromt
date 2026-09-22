export type {
  ConsultationDate,
  ConsultationDraft,
  ConsultationKind,
  ConsultationTeacher,
  ConsultationType,
  CounselingCategory,
  ReservationInput,
  ReservationStatus,
  StudentReservation,
  TeacherReservation,
  TeacherSlotStatus,
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
export { getReservationPresentation, isActiveReservation } from "./model/status.ts";

export type { ProfileConsultation } from "./model/profile.ts";
export { decodeProfileConsultationId, toProfileConsultation } from "./model/profile.ts";
export {
  getConsultationCancelError,
  isConsultationCancelable,
  isConsultationUpcoming,
} from "./model/timePolicy.ts";
export { getConsultationTeacherLabel } from "./model/labels.ts";
export { createConsultationRefreshCoordinator } from "./model/refreshCoordinator.ts";
export {
  RESERVATION_CHANGED_EVENT,
  isReservationRealtimeEvent,
} from "./model/realtime.ts";
export type { ReservationRealtimeEvent } from "./model/realtime.ts";

export { CONSULTATION_SCHEDULE, getConsultationScheduleItem } from "./model/schedule.ts";
