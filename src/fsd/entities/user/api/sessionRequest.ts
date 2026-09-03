import {
  createAuthenticatedRequest,
  request,
} from "../../../shared/api/index.ts";
import type { AuthSession } from "../model/types.ts";
import {
  isRememberedSession,
  readAccessToken,
} from "../model/session.ts";
import {
  clearSession,
  getSession,
  saveSession,
} from "../model/lifecycle.ts";

const reissueSession = async (refreshToken: string) => {
  const response = await request<Omit<AuthSession, "role">>("/auth/reissue", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  saveSession(response, isRememberedSession());
};

export const requestWithSession = createAuthenticatedRequest({
  request,
  readAccessToken,
  getRefreshToken: () => getSession()?.refreshToken,
  reissueSession,
  clearSession,
});
