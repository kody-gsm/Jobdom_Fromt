import { createConsultationApi } from "@fsd/entities/consultation";
import { getSession, requestWithSession } from "@fsd/entities/user";

const consultationApi = createConsultationApi(requestWithSession);

export const getTeacherConsultations = consultationApi.getTeacher;
export const getPendingTeacherConsultations = consultationApi.getPendingTeacher;
export const approveConsultation = consultationApi.approve;
export const rejectConsultation = consultationApi.reject;
export const lockConsultation = consultationApi.lock;
export const unlockConsultation = consultationApi.unlock;
export const getTeacherSlotStatus = consultationApi.getTeacherSlotStatus;
export type { TeacherSlotStatus } from "@fsd/entities/consultation";
export { getSession };
