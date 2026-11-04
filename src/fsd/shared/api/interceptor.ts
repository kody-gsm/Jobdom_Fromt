// 특정 화면(예: 튜토리얼 연습)이 서버 대신 요청에 답할 수 있게 하는 확장 지점이다.
// shared는 업무 규칙을 모르므로, 응답 여부와 내용은 등록한 쪽이 정한다.
export type InterceptedRequest = {
  method: string;
  path: string;
  body: BodyInit | null | undefined;
  responseType?: "blob";
};

export type InterceptedResponse =
  | { handled: false }
  | { handled: true; status: number; data?: unknown; message?: string };

export type RequestInterceptor = (request: InterceptedRequest) => InterceptedResponse;

let activeInterceptor: RequestInterceptor | null = null;
const interceptorListeners = new Set<() => void>();

export const setRequestInterceptor = (interceptor: RequestInterceptor | null) => {
  if (activeInterceptor === interceptor) return;
  activeInterceptor = interceptor;
  interceptorListeners.forEach((listener) => listener());
};

// 응답하는 쪽이 바뀌면(실제 서버 ↔ 연습용) 화면 밖에서 들고 있는 값(예: 알림 개수)을 다시 받게 알린다.
export const subscribeRequestInterceptor = (listener: () => void) => {
  interceptorListeners.add(listener);
  return () => {
    interceptorListeners.delete(listener);
  };
};

export const getRequestInterceptor = () => activeInterceptor;
