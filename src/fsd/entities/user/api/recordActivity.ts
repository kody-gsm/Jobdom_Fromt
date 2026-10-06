import { request, ApiError } from "@fsd/shared/api";
import { readAccessToken } from "../model/session.ts";
import { getActivityPagePath } from "../model/activity.ts";
import type { ActivityAction } from "../model/activity.ts";

// 백엔드 API가 준비된 환경에서만 활성화한다.
export const ACTIVITY_API_ENABLED = process.env.NEXT_PUBLIC_ACTIVITY_API_ENABLED === "true";

export const recordActivity = (activity: ActivityAction, durationMs: number | null = null) => {
  if (!ACTIVITY_API_ENABLED) return;
  try {
    const accessToken = readAccessToken();
    if (!accessToken) return;
    // ponytail: 실패한 기록은 누락된다. 오프라인 기록 보장이 필요하면 보관·재전송 큐를 추가한다.
    // 재발급/세션 정리 없이 전송해 부가 기록의 실패가 로그인 상태를 바꾸지 않게 한다.
    void request<void>("/activity/events", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        eventId: crypto.randomUUID(),
        ...activity,
        occurredAt: new Date().toISOString(),
        durationMs,
      }),
    }, { accessToken }).catch((error: unknown) => {
      console.warn("활동 기록 전송에 실패했습니다.", error instanceof ApiError ? error.status : "전송 오류");
    });
  } catch {
    console.warn("활동 기록을 전송하지 못했습니다.");
  }
};

export const recordPageView = (path: string) => {
  const pathname = getActivityPagePath(path);
  if (pathname) recordActivity({ type: "PAGE_VIEW", path: pathname });
};
