import { ApiError } from "./ApiError.ts";

const getApiBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "");

const parseErrorMessage = async (response: Response) => {
  if ([502, 503, 504].includes(response.status)) {
    return "백엔드 서버에 연결할 수 없습니다.";
  }

  const text = await response.text();
  if (response.status === 500 && text.trim() === "Internal Server Error") {
    return "백엔드 서버에 연결할 수 없습니다.";
  }
  if (!text) return `요청에 실패했습니다. (${response.status})`;

  try {
    const data = JSON.parse(text) as { message?: string; error?: string };
    return data.message || data.error || text;
  } catch {
    return text;
  }
};

interface RequestOptions {
  accessToken?: string | null;
}
export const request = async <T>(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {},
): Promise<T> => {
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
    response = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("백엔드 서버에 연결할 수 없습니다.", 0);
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;
  if (response.headers.get("content-type")?.includes("application/json")) {
    return JSON.parse(text) as T;
  }
  return text as T;
};
