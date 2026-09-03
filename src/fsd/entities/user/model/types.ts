export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  email: string;
  name: string;
  role: UserRole;
}
