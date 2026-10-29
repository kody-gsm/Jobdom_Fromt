import { ApiError } from "./ApiError.ts";
import type { ApiRequestInit } from "./client.ts";
import { authenticatedGetCache } from "@fsd/shared/lib";

const AUTHENTICATED_GET_CACHE_TTL_MS = 30_000;

interface RawRequest {
  <T>(
    path: string,
    init?: ApiRequestInit,
    options?: { accessToken?: string | null },
  ): Promise<T>;
}

interface AuthenticatedRequestDependencies {
  request: RawRequest;
  readAccessToken: () => string | null;
  getRefreshToken: () => string | null | undefined;
  getSessionVersion?: () => number;
  reissueSession: (refreshToken: string) => Promise<void>;
  clearSession: () => void;
}

export const createAuthenticatedRequest = ({
  request,
  readAccessToken,
  getRefreshToken,
  getSessionVersion,
  reissueSession,
  clearSession,
}: AuthenticatedRequestDependencies) => {
  let reissuePending: { token: string; promise: Promise<void> } | null = null;

  const reissueCurrentSession = async (refreshToken: string) => {
    if (reissuePending?.token === refreshToken) return reissuePending.promise;
    const pending = { token: refreshToken, promise: reissueSession(refreshToken) };
    reissuePending = pending;
    try {
      await pending.promise;
    } finally {
      if (reissuePending === pending) reissuePending = null;
    }
  };

  const authenticatedRequest = async <T>(
    path: string,
    init: ApiRequestInit = {},
    retryAuth = true,
  ): Promise<T> => {
    const accessToken = readAccessToken();
    const refreshTokenAtStart = getRefreshToken();
    const sessionVersion = getSessionVersion?.();
    const hasSameOwner = () => !getSessionVersion || getSessionVersion() === sessionVersion;
    const isCurrentSession = () => readAccessToken() === accessToken
      && getRefreshToken() === refreshTokenAtStart && hasSameOwner();
    const method = (init.method ?? "GET").toUpperCase();
    const isCacheableGet = method === "GET"
      && !init.signal
      && init.responseType !== "blob"
      && init.cache !== "no-store"
      && Boolean(accessToken);
    const execute = () => request<T>(path, init, { accessToken });

    if (method === "GET" && init.cache === "no-store" && accessToken) {
      authenticatedGetCache.clear(`${accessToken}:${path}`);
    }

    try {
      if (isCacheableGet) {
        return await authenticatedGetCache.getOrFetch(
          `${accessToken}:${path}`,
          execute,
          AUTHENTICATED_GET_CACHE_TTL_MS,
        );
      }

      const result = await execute();
      if (method !== "GET") {
        if (init.invalidateCache === undefined) authenticatedGetCache.clear();
        else for (const prefix of init.invalidateCache) authenticatedGetCache.clear(`${accessToken}:${prefix}`);
      }
      return result;
    } catch (error) {
      const refreshToken = getRefreshToken();
      if (error instanceof ApiError && error.status === 401 && !isCurrentSession()) {
        // A concurrent refresh can rotate tokens for this same session. A login
        // or logout changes its version and must never inherit the old request.
        if (getSessionVersion && hasSameOwner() && retryAuth && readAccessToken()) {
          return authenticatedRequest<T>(path, init, false);
        }
        throw error;
      }
      if (error instanceof ApiError && error.status === 401 && retryAuth && refreshToken) {
        try {
          await reissueCurrentSession(refreshToken);
        } catch (reissueError) {
          if (
            reissueError instanceof ApiError &&
            (reissueError.status === 0 || reissueError.status >= 500)
          ) {
            throw reissueError;
          }
          if (isCurrentSession()) {
            authenticatedGetCache.clear();
            clearSession();
          }
          throw reissueError;
        }
        if (!hasSameOwner()) throw error;
        return authenticatedRequest<T>(path, init, false);
      }

      if (error instanceof ApiError && error.status === 401 && isCurrentSession()) {
        authenticatedGetCache.clear();
        clearSession();
      }
      throw error;
    }
  };

  return authenticatedRequest;
};
