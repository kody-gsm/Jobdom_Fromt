import { createConsultationApi } from "@fsd/entities/consultation";
import { requestWithSession } from "@fsd/entities/user";
import { createCancelProfileConsultation } from "../model/createCancelProfileConsultation.ts";

const consultationApi = createConsultationApi(requestWithSession);

export const cancelProfileConsultation = createCancelProfileConsultation(
  consultationApi.cancel,
);
