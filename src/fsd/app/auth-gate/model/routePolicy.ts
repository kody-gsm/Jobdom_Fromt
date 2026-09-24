import type { UserRole } from "@fsd/entities/user";

const PUBLIC_ROUTES = new Set(["/login", "/signup", "/forgot-password"]);

export const getAuthRedirect = (
  pathname: string,
  role: UserRole | null,
): string | null => {
  if (PUBLIC_ROUTES.has(pathname)) return null;
  if (!role) return "/login";

  const isTeacher = role === "TEACHER" || role === "WEE_TEACHER";
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  if (role === "ADMIN") return isAdminRoute ? null : "/admin";
  if (isAdminRoute) return isTeacher ? "/teacher" : "/";

  const isTeacherRoute = pathname === "/teacher" || pathname.startsWith("/teacher/");
  if (isTeacherRoute && !isTeacher) return "/";
  if (!isTeacherRoute && pathname !== "/profile" && isTeacher) return "/teacher";

  return null;
};
