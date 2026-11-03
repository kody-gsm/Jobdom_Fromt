// pending: 서버가 미완료라고 응답함, failed: 상태 조회 실패(서비스 이용을 막지 않는다)
export type TutorialStatusState = "pending" | "completed" | "failed";
export type TutorialMode = "first-run" | "replay";

// 처음 안내는 완료 저장이 필요하므로 다시 보기 요청보다 우선한다.
export const getTutorialMode = (
  statusState: TutorialStatusState | null,
  isReplayRequested: boolean,
): TutorialMode | null => {
  if (statusState === "pending") return "first-run";
  return isReplayRequested ? "replay" : null;
};

// 실패한 조회는 캐시하지 않고, 사용자가 다른 화면으로 이동할 때 다시 확인한다.
export const getStatusRetryKey = (statusState: TutorialStatusState | null, pathname: string) =>
  statusState === "failed" ? pathname : "";
