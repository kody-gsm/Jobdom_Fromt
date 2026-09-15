import type { UserRole } from "./types.ts";

export const decodeUserRole = (token: string): UserRole => {
  try {
    const raw = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = raw.padEnd(Math.ceil(raw.length / 4) * 4, "=");
    const role = JSON.parse(atob(payload)).role;
    if (role === "ADMIN") return "ADMIN";
    if (role === "TEACHER" || role === "WEE_TEACHER") return role;
    return "STUDENT";
  } catch {
    return "STUDENT";
  }
};

export const getRoleHomePath = (role: UserRole) => {
  if (role === "ADMIN") return "/admin";
  if (role === "TEACHER" || role === "WEE_TEACHER") return "/teacher";
  return "/";
};
