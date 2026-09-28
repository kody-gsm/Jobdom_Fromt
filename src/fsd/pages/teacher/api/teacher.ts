import { createConsultationApi } from "@fsd/entities/consultation";
import type { ConsultationKind, CounselingCategory, TeacherSlotStatus } from "@fsd/entities/consultation";
import { createBannerApi } from "@fsd/entities/banner";
import { getSession, requestWithSession } from "@fsd/entities/user";

const consultationApi = createConsultationApi(requestWithSession);
const bannerApi = createBannerApi(requestWithSession);

export const getTeacherConsultations = consultationApi.getTeacher;
export const getPendingTeacherConsultations = consultationApi.getPendingTeacher;
export const approveConsultation = consultationApi.approve;
export const rejectConsultation = consultationApi.reject;
export const lockConsultation = consultationApi.lock;
export const unlockConsultation = consultationApi.unlock;
export const getTeacherSlotStatus = consultationApi.getTeacherSlotStatus;
export type { TeacherSlotStatus };

export type SimpleStudent = {
    id: number;
    name: string;
    student_number: string;
};

export const getTeacherStudents = () =>
    requestWithSession<SimpleStudent[]>("/teacher/students");
export const getTeacherBanner = bannerApi.getTeacher;
export const saveTeacherBanner = bannerApi.saveTeacher;

export type ForceReservationInput = {
    studentId: number;
    title: string;
    content: string;
    category: CounselingCategory;
    date: string;
    period: string;
};

export const forceCreateConsultation = (kind: ConsultationKind, input: ForceReservationInput) =>
    requestWithSession<string>(`/teacher/${kind}/force`, {
        method: "POST",
        body: JSON.stringify(input),
    });

export { getSession };
