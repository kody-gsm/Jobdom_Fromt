import { setRequestInterceptor } from "@fsd/shared/api";
import { authenticatedGetCache } from "@fsd/shared/lib";
import type { PracticeIdentity } from "./practiceServer.ts";

// 연습 모드가 켜져 있는 동안 모든 요청은 연습용 서버가 답한다.
// 켜고 끌 때 캐시를 비워서 실제 데이터와 연습 데이터가 섞이지 않게 한다.
let activeKey: string | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

// 연습용 서버 코드는 튜토리얼을 여는 사람만 내려받는다.
let loadingKey: string | null = null;

export const startPractice = async (key: string, identity: PracticeIdentity) => {
  if (activeKey === key || loadingKey === key) return;
  loadingKey = key;
  const { createPracticeServer } = await import("./practiceServer.ts");
  // 불러오는 사이 튜토리얼이 끝났거나 다른 연습으로 바뀌었으면 켜지 않는다.
  if (loadingKey !== key) return;
  loadingKey = null;
  const server = createPracticeServer(identity);
  setRequestInterceptor(server.handle);
  authenticatedGetCache.clear();
  activeKey = key;
  notify();
};

export const stopPractice = () => {
  loadingKey = null;
  if (activeKey === null) return;
  setRequestInterceptor(null);
  authenticatedGetCache.clear();
  activeKey = null;
  notify();
};

export const subscribePractice = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getPracticeKey = () => activeKey;
