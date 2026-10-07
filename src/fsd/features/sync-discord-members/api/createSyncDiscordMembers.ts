export type DiscordMemberSyncResult = {
  scannedMembers: number;
  linkedStudents: number;
  updatedStudents: number;
};

type RequestFn = <T>(path: string, init?: RequestInit) => Promise<T>;

export const createSyncDiscordMembers = (request: RequestFn) => async () => {
  const result = await request<DiscordMemberSyncResult>("/admin/discord/members/sync", { method: "POST" });
  if (!result || [result.scannedMembers, result.linkedStudents, result.updatedStudents]
    .some((count) => !Number.isSafeInteger(count) || count < 0)) {
    throw new Error("학생 ID 저장 응답 형식이 올바르지 않습니다.");
  }
  return result;
};
