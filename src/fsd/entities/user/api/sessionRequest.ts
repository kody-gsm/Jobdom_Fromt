import {
  createAuthenticatedRequest,
  ApiError,
  request,
} from "@fsd/shared/api";
import type { AuthSession } from "../model/types.ts";
import {
  isRememberedSession,
  getSessionVersion,
  readAccessToken,
} from "../model/session.ts";
import {
  clearSession,
  getSession,
  saveSession,
} from "../model/lifecycle.ts";
import { createActivityTrackingRequest } from "./createActivityTrackingRequest.ts";
import { ACTIVITY_API_ENABLED, recordActivity } from "./recordActivity.ts";

const reissueSession = async (refreshToken: string) => {
  const sessionVersion = getSessionVersion();
  const initialSession = getSession();
  if (initialSession?.refreshToken !== refreshToken) {
    throw new ApiError("인증 세션이 변경되었습니다.", 0);
  }
  const response = await request<Omit<AuthSession, "role">>("/auth/reissue", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  const latest = getSession();
  if (
    getSessionVersion() !== sessionVersion
    || latest?.accessToken !== initialSession.accessToken
    || latest?.refreshToken !== refreshToken
  ) {
    throw new ApiError("인증 세션이 변경되었습니다.", 0);
  }
  saveSession(response, isRememberedSession(), { isRefresh: true });
};

const authenticatedRequest = createAuthenticatedRequest({
  request,
  readAccessToken,
  getRefreshToken: () => getSession()?.refreshToken,
  getSessionVersion,
  reissueSession,
  clearSession,
});

export const requestWithSession = createActivityTrackingRequest(
  authenticatedRequest,
  recordActivity,
  () => getSession()?.userId ?? null,
  ACTIVITY_API_ENABLED,
);
