import { requestWithSession } from "@fsd/entities/user";
import { createApiStatisticsApi } from "./createApiStatisticsApi.ts";

export const getApiStatistics = createApiStatisticsApi(requestWithSession);
