const REPLAY_EVENT = "jobdam-tutorial-replay";

// 완료 상태는 서버에 그대로 두고, 현재 탭에서만 안내를 처음부터 다시 연다.
export const requestTutorialReplay = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(REPLAY_EVENT));
};

export const subscribeTutorialReplay = (listener: () => void) => {
  window.addEventListener(REPLAY_EVENT, listener);
  return () => window.removeEventListener(REPLAY_EVENT, listener);
};
