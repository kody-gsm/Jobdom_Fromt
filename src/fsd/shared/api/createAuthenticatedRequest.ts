import { ApiError } from "./ApiError.ts";
import type { ApiRequestInit } from "./client.ts";
import { authenticatedGetCache } from "../lib/requestCache.ts";

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
  reissueSession: (refreshToken: string) => Promise<void>;
  clearSession: () => void;
}

export const createAuthenticatedRequest = ({
  request,
  readAccessToken,
  getRefreshToken,
  reissueSession,
  clearSession,
}: AuthenticatedRequestDependencies) => {
  let reissuePromise: Promise<void> | null = null;

  const reissueCurrentSession = async (refreshToken: string) => {
    if (reissuePromise) return reissuePromise;
    reissuePromise = reissueSession(refreshToken);
    try {
      await reissuePromise;
    } finally {
      reissuePromise = null;
    }
  };

  const authenticatedRequest = async <T>(
    path: string,
    init: ApiRequestInit = {},
    retryAuth = true,
  ): Promise<T> => {
    const accessToken = readAccessToken();
    const method = (init.method ?? "GET").toUpperCase();
    const isCacheableGet = method === "GET"
      && !init.signal
      && init.responseType !== "blob"
      && Boolean(accessToken);
    const execute = () => request<T>(path, init, { accessToken });

    try {
      if (isCacheableGet) {
        return await authenticatedGetCache.getOrFetch(
          `${accessToken}:${path}`,
          execute,
          AUTHENTICATED_GET_CACHE_TTL_MS,
        );
      }

      const result = await execute();
      if (method !== "GET") authenticatedGetCache.clear();
      return result;
    } catch (error) {
      const refreshToken = getRefreshToken();
      if (error instanceof ApiError && error.status === 401 && retryAuth && refreshToken) {
        try {
          await reissueCurrentSession(refreshToken);
          return authenticatedRequest<T>(path, init, false);
        } catch (reissueError) {
          if (
            reissueError instanceof ApiError &&
            (reissueError.status === 0 || reissueError.status >= 500)
          ) {
            throw reissueError;
          }
        }
      }

      if (error instanceof ApiError && error.status === 401) {
        authenticatedGetCache.clear();
        clearSession();
      }
      throw error;
    }
  };

  return authenticatedRequest;
};
