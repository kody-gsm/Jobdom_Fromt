import { ApiError } from "./ApiError.ts";

const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "");

type ParsedApiError = { message: string; code?: string };
export type ApiRequestInit = RequestInit & {
  responseType?: "blob";
  /** Cache URL prefixes affected by a mutation. Omit for conservative full invalidation. */
  invalidateCache?: readonly string[];
  timeoutMs?: number;
};

const parseError = async (response: Response): Promise<ParsedApiError> => {
  if ([502, 503, 504].includes(response.status)) {
    return { message: "백엔드 서버에 연결할 수 없습니다." };
  }

  const text = await response.text();
  if (response.status === 500 && text.trim() === "Internal Server Error") {
    return { message: "백엔드 서버에 연결할 수 없습니다." };
  }
  if (!text) return { message: `요청에 실패했습니다. (${response.status})` };

  try {
    const data = JSON.parse(text) as { code?: unknown; message?: unknown; error?: unknown };
    const message = [data.message, data.error].find(
      (value): value is string => typeof value === "string" && value.length > 0,
    ) ?? text;
    const code = typeof data.code === "string" && data.code.length > 0 ? data.code : undefined;
    return { message, code };
  } catch {
    return { message: text };
  }
};

interface RequestOptions {
  accessToken?: string | null;
}
export const request = async <T>(
  path: string,
  init: ApiRequestInit = {},
  options: RequestOptions = {},
): Promise<T> => {
  const { responseType, timeoutMs, signal, ...fetchInit } = init;
  delete fetchInit.invalidateCache;
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  if (!isFormData && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const controller = new AbortController();
  const abortFromCaller = () => controller.abort(signal?.reason);
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener("abort", abortFromCaller, { once: true });
  const defaultTimeout = isFormData || responseType === "blob" ? 120_000 : 30_000;
  const duration = typeof timeoutMs === "number" && Number.isFinite(timeoutMs) && timeoutMs > 0
    ? timeoutMs : defaultTimeout;
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, duration);
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, { ...fetchInit, headers, signal: controller.signal });
    if (!response.ok) {
      const error = await parseError(response);
      throw new ApiError(error.message, response.status, error.code);
    }
    if (response.status === 204) return undefined as T;
    if (responseType === "blob") return await response.blob() as T;

    const text = await response.text();
    if (!text) return undefined as T;
    if (response.headers.get("content-type")?.includes("application/json")) {
      return JSON.parse(text) as T;
    }
    return text as T;
  } catch (error) {
    if (timedOut) throw new ApiError("요청 시간이 초과되었습니다. 다시 시도해주세요.", 0, "REQUEST_TIMEOUT");
    if (signal?.aborted) throw new ApiError("요청이 취소되었습니다.", 0, "REQUEST_ABORTED");
    if (error instanceof ApiError) throw error;
    throw new ApiError("백엔드 서버에 연결할 수 없습니다.", 0);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
};
