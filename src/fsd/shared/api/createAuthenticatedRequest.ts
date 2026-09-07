import { ApiError } from "./ApiError.ts";

interface RawRequest {
  <T>(
    path: string,
    init?: RequestInit,
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
    init: RequestInit = {},
    retryAuth = true,
  ): Promise<T> => {
    try {
      return await request<T>(path, init, { accessToken: readAccessToken() });
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

      if (error instanceof ApiError && error.status === 401) clearSession();
      throw error;
    }
  };

  return authenticatedRequest;
};
