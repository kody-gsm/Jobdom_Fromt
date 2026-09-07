import { clearSession, getSession } from "@fsd/entities/user";
import { request } from "@fsd/shared/api";
import { createLogoutAction } from "./createLogoutAction.ts";

export const logout = createLogoutAction({
  getRefreshToken: () => getSession()?.refreshToken,
  clearSession,
  request,
});
