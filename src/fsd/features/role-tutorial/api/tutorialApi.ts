import { requestWithSession } from "@fsd/entities/user";
import { createTutorialApi } from "./createTutorialApi.ts";

export const tutorialApi = createTutorialApi(requestWithSession);
