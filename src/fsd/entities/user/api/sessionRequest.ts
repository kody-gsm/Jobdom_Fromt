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

type PendingReissue = {
  sessionVersion: number;
  accessToken: string;
  refreshToken: string;
  subscribers: Set<() => boolean>;
  promise: Promise<void>;
};
let pendingReissue: PendingReissue | null = null;

export const reissueSession = async (
  refreshToken: string,
  canApply: () => boolean = () => true,
) => {
  const sessionVersion = getSessionVersion();
  const initialSession = getSession();
  if (initialSession?.refreshToken !== refreshToken) {
    throw new ApiError("인증 세션이 변경되었습니다.", 0);
  }
  if (
    pendingReissue?.sessionVersion === sessionVersion
    && pendingReissue.accessToken === initialSession.accessToken
    && pendingReissue.refreshToken === refreshToken
  ) {
    pendingReissue.subscribers.add(canApply);
    return pendingReissue.promise;
  }

  const subscribers = new Set([canApply]);
  const execute = async () => {
    const response = await request<Omit<AuthSession, "role">>("/auth/reissue", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    const latest = getSession();
    if (
      getSessionVersion() !== sessionVersion
      || latest?.accessToken !== initialSession.accessToken
      || latest?.refreshToken !== refreshToken
      || ![...subscribers].some((isActive) => isActive())
    ) {
      throw new ApiError("인증 세션이 변경되었습니다.", 0);
    }
    saveSession(response, isRememberedSession(), { isRefresh: true });
  };
  const promise = execute().finally(() => {
    if (pendingReissue?.promise === promise) pendingReissue = null;
  });
  pendingReissue = { sessionVersion, accessToken: initialSession.accessToken, refreshToken, subscribers, promise };
  return promise;
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
