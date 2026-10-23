export type TutorialRole = "STUDENT" | "TEACHER" | "WEE_TEACHER";
export type TutorialStorage = Pick<Storage, "getItem" | "setItem">;

export const getTutorialRole = (role: string | undefined): TutorialRole | null => {
  if (role === "STUDENT" || role === "TEACHER" || role === "WEE_TEACHER") return role;
  return null;
};

export const getTutorialStorageKey = (userId: number, role: TutorialRole) =>
  `jobdam:tutorial:v1:${userId}:${role}`;

// shortcut: 완료 여부는 이 브라우저에만 저장한다. 계정 확인 API가 생기면 연결한다.
export const readTutorialCompletion = (storage: TutorialStorage | null, key: string) => {
  try {
    return storage?.getItem(key) === "completed";
  } catch {
    return false;
  }
};

export const saveTutorialCompletion = (storage: TutorialStorage | null, key: string) => {
  if (!storage) return false;
  try {
    storage.setItem(key, "completed");
    return true;
  } catch {
    return false;
  }
};
