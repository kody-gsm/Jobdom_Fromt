import { setRequestInterceptor } from "@fsd/shared/api";
import { authenticatedGetCache } from "@fsd/shared/lib";
import { createPracticeServer, type PracticeIdentity } from "./practiceServer.ts";

// 연습 모드가 켜져 있는 동안 모든 요청은 연습용 서버가 답한다.
// 켜고 끌 때 캐시를 비워서 실제 데이터와 연습 데이터가 섞이지 않게 한다.
let activeKey: string | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

export const startPractice = (key: string, identity: PracticeIdentity) => {
  if (activeKey === key) return;
  const server = createPracticeServer(identity);
  setRequestInterceptor(server.handle);
  authenticatedGetCache.clear();
  activeKey = key;
  notify();
};

export const stopPractice = () => {
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
