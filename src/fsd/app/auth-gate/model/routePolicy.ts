import type { UserRole } from "../../../entities/user/index.ts";

const PUBLIC_ROUTES = new Set(["/login", "/signup", "/forgot-password"]);

export const getAuthRedirect = (
  pathname: string,
  role: UserRole | null,
): string | null => {
  if (PUBLIC_ROUTES.has(pathname)) return null;
  if (!role) return "/login";

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  if (role === "ADMIN") return isAdminRoute ? null : "/admin";
  if (isAdminRoute) return role === "TEACHER" ? "/teacher" : "/";

  const isTeacherRoute = pathname === "/teacher" || pathname.startsWith("/teacher/");
  if (isTeacherRoute && role !== "TEACHER") return "/";
  if (!isTeacherRoute && role === "TEACHER") return "/teacher";

  return null;
};
