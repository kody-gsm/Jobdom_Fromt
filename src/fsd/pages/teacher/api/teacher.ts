import { createConsultationApi } from "@fsd/entities/consultation";
import { getSession, requestWithSession } from "@fsd/entities/user";

const consultationApi = createConsultationApi(requestWithSession);

export const getTeacherConsultations = consultationApi.getTeacher;
export const getPendingTeacherConsultations = consultationApi.getPendingTeacher;
export const approveConsultation = consultationApi.approve;
export const rejectConsultation = consultationApi.reject;
export { getSession };
