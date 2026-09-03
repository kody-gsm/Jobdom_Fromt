import { requestWithSession } from "@fsd/entities/user";
import { createSyncStudents } from "./createSyncStudents.ts";

export const syncStudents = createSyncStudents(requestWithSession);
