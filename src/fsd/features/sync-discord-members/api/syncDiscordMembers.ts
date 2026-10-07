import { requestWithSession } from "@fsd/entities/user";
import { createSyncDiscordMembers } from "./createSyncDiscordMembers.ts";

export const syncDiscordMembers = createSyncDiscordMembers(requestWithSession);
