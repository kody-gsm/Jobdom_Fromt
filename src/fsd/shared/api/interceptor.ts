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

export const setRequestInterceptor = (interceptor: RequestInterceptor | null) => {
  activeInterceptor = interceptor;
};

export const getRequestInterceptor = () => activeInterceptor;
