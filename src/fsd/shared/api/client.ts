import { ApiError } from "./ApiError.ts";

const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "");

type ParsedApiError = { message: string; code?: string };
export type ApiRequestInit = RequestInit & { responseType?: "blob" };

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
  const { responseType, ...fetchInit } = init;
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  if (!isFormData && init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, { ...fetchInit, headers });
  } catch {
    throw new ApiError("백엔드 서버에 연결할 수 없습니다.", 0);
  }

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
};
