import { createRecruitApi, rememberRecruitFormLinks } from "@fsd/entities/recruit";
import { requestWithSession } from "@fsd/entities/user";

const recruitApi = createRecruitApi(requestWithSession);

export const getRecruits: typeof recruitApi.getAll = async (init) => rememberRecruitFormLinks(await recruitApi.getAll(init));
