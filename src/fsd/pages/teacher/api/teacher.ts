import { createConsultationApi } from "@fsd/entities/consultation";
import type { ConsultationKind } from "@fsd/entities/consultation";
import { getSession, requestWithSession } from "@fsd/entities/user";

const consultationApi = createConsultationApi(requestWithSession);

export const getTeacherConsultations = consultationApi.getTeacher;
export const getPendingTeacherConsultations = consultationApi.getPendingTeacher;
export const approveConsultation = consultationApi.approve;
export const rejectConsultation = consultationApi.reject;
export const lockConsultation = consultationApi.lock;
export const unlockConsultation = consultationApi.unlock;

export type TeacherSlotStatus = {
    teacherId: number;
    date: string;
    period: string;
    state: "CANCEL" | "WAITING" | "RESERVED" | "LOCKED" | "AUTO";
    available: boolean;
};

export const getTeacherSlotStatus = (kind: ConsultationKind, teacherId: number, date: string) => {
    const query = new URLSearchParams({ teacherId: String(teacherId), date });
    return requestWithSession<TeacherSlotStatus[]>(`/teacher/${kind}/status?${query.toString()}`);
};
export { getSession };
