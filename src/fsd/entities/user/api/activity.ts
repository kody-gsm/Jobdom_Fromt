import { requestWithSession } from "./sessionRequest.ts";
import { createActivityApi } from "./createActivityApi.ts";

export const activityApi = createActivityApi(requestWithSession);
