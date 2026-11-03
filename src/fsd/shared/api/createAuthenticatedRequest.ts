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
  /** true면 보내기 전에 먼저 재발급한다. 만료가 확실한 토큰만 true를 돌려야 한다. */
  isAccessTokenStale?: (accessToken: string) => boolean;
  /** true면 토큰이 하나도 없을 때 보내지 않고 401로 끝낸다. 저장소가 있는 브라우저에서만 켠다. */
  rejectWithoutCredentials?: () => boolean;
}

export const createAuthenticatedRequest = ({
  request,
  readAccessToken,
  getRefreshToken,
  getSessionVersion,
  reissueSession,
  clearSession,
  isAccessTokenStale,
  rejectWithoutCredentials,
}: AuthenticatedRequestDependencies) => {
  let reissuePending: { token: string; promise: Promise<void> } | null = null;
  // 기기 시계가 서버보다 빠르면 새 토큰도 만료로 보인다. 방금 받은 토큰은 다시 미리 재발급하지 않는다.
  let proactivelyIssuedToken: string | null = null;

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
    const tokenAtCall = readAccessToken();
    const refreshTokenAtCall = getRefreshToken();
    // 로그인 정보가 전혀 없으면 서버에 보내 봐야 401뿐이다. 지울 세션도 없으므로 바로 실패한다.
    if (!tokenAtCall && !refreshTokenAtCall && rejectWithoutCredentials?.()) {
      throw new ApiError("로그인이 필요합니다.", 401);
    }
    // 만료된 토큰으로 보내 401을 받은 뒤 재발급하는 왕복을 줄인다. 재발급은 요청끼리 공유한다.
    if (
      retryAuth && tokenAtCall && refreshTokenAtCall
      && tokenAtCall !== proactivelyIssuedToken && isAccessTokenStale?.(tokenAtCall)
    ) {
      const versionAtCall = getSessionVersion?.();
      try {
        await reissueCurrentSession(refreshTokenAtCall);
        proactivelyIssuedToken = readAccessToken();
      } catch (reissueError) {
        const isTransient = reissueError instanceof ApiError
          && (reissueError.status === 0 || reissueError.status >= 500);
        const unchanged = readAccessToken() === tokenAtCall
          && getRefreshToken() === refreshTokenAtCall
          && getSessionVersion?.() === versionAtCall;
        if (!isTransient && unchanged) {
          authenticatedGetCache.clear();
          clearSession();
          throw reissueError;
        }
        // 일시적인 실패나 다른 탭의 세션 교체는 원래 흐름(401 뒤 재발급)에 맡긴다.
      }
      if (getSessionVersion && getSessionVersion() !== versionAtCall) {
        throw new ApiError("인증 세션이 변경되었습니다.", 401);
      }
    }
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
