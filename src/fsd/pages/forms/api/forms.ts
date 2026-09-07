import { createFormApi } from "@fsd/entities/form";
import { requestWithSession } from "@fsd/entities/user";

export const formsApi = createFormApi(requestWithSession);
