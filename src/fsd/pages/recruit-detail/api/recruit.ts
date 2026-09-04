import { createRecruitApi } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";

const recruitApi = createRecruitApi(requestWithSession);

export const getRecruit = recruitApi.getById;
