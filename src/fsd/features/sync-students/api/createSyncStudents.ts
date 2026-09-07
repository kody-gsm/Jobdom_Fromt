export interface StudentSyncResult {
  syncedCount: number;
}

interface RequestFn {
  <T>(path: string, init?: RequestInit): Promise<T>;
}

export const createSyncStudents = (request: RequestFn) => () =>
  request<StudentSyncResult>("/admin/students/sync", { method: "POST" });
