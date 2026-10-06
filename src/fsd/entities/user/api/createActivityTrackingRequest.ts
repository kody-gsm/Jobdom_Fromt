import { getActionActivity } from "../model/activity.ts";
import type { ActivityAction } from "../model/activity.ts";
import type { ApiRequestInit } from "@fsd/shared/api";

type RequestFn = <T>(path: string, init?: ApiRequestInit) => Promise<T>;

export const createActivityTrackingRequest = (
  request: RequestFn,
  record: (activity: ActivityAction, durationMs: number) => void,
  getUserId: () => number | null,
  enabled: boolean,
) => async <T>(path: string, init?: ApiRequestInit): Promise<T> => {
  if (!enabled) return request<T>(path, init);
  const userId = getUserId();
  const startedAt = performance.now();
  const response = await request<T>(path, init);
  const activity = getActionActivity(path, init?.method);
  if (activity && userId !== null && userId === getUserId()) {
    // 기록 실패는 이미 성공한 사용자 작업의 결과를 바꾸지 않는다.
    try {
      record(activity, Math.max(0, Math.round(performance.now() - startedAt)));
    } catch {
      console.warn("활동 기록을 전송하지 못했습니다.");
    }
  }
  return response;
};
