import { saveSession } from "@fsd/entities/user";
import { request } from "@fsd/shared/api";
import { createLoginAction } from "./createLoginAction.ts";

export const login = createLoginAction({ request, saveSession });
