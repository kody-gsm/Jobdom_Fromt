import { createConsultationApi } from "@fsd/entities/consultation";
import { requestWithSession } from "@fsd/entities/user";

const consultationApi = createConsultationApi(requestWithSession);

export const getUpcomingConsultations = consultationApi.getUpcoming;
export const submitConsultation = consultationApi.create;
