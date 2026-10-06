import {
  createAuthenticatedRequest,
  request,
} from "@fsd/shared/api";
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
import { createActivityTrackingRequest } from "./createActivityTrackingRequest.ts";
import { ACTIVITY_API_ENABLED, recordActivity } from "./recordActivity.ts";

const reissueSession = async (refreshToken: string) => {
  const response = await request<Omit<AuthSession, "role">>("/auth/reissue", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });

  saveSession(response, isRememberedSession());
};

const authenticatedRequest = createAuthenticatedRequest({
  request,
  readAccessToken,
  getRefreshToken: () => getSession()?.refreshToken,
  reissueSession,
  clearSession,
});

export const requestWithSession = createActivityTrackingRequest(
  authenticatedRequest,
  recordActivity,
  () => getSession()?.userId ?? null,
  ACTIVITY_API_ENABLED,
);
