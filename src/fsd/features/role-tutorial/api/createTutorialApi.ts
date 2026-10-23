type RequestFn = <T>(path: string, init?: RequestInit) => Promise<T>;

const readCompleted = (result: unknown) => {
  if (typeof result !== "object" || result === null || !("tutorialCompleted" in result) || typeof result.tutorialCompleted !== "boolean") {
    throw new Error("튜토리얼 상태 응답 형식이 올바르지 않습니다.");
  }
  return result.tutorialCompleted;
};

export const createTutorialApi = (request: RequestFn) => ({
  isCompleted: async (signal?: AbortSignal) => readCompleted(await request<unknown>("/auth/tutorial", { signal })),
  complete: async () => {
    if (!readCompleted(await request<unknown>("/auth/tutorial/complete", { method: "PATCH" }))) {
      throw new Error("튜토리얼 완료 상태가 저장되지 않았습니다.");
    }
  },
});
