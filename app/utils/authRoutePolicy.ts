export type AuthRole = "STUDENT" | "TEACHER" | "ADMIN";

const PUBLIC_ROUTES = new Set(["/login", "/signup", "/forgot-password"]);

export const isPublicRoute = (pathname: string) => PUBLIC_ROUTES.has(pathname);

export const getAuthRedirect = (
  pathname: string,
  role: AuthRole | null,
): string | null => {
  if (isPublicRoute(pathname)) return null;
  if (!role) return "/login";

  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  if (role === "ADMIN") return isAdminRoute ? null : "/admin";
  if (isAdminRoute) return role === "TEACHER" ? "/teacher" : "/";

  const isTeacherRoute = pathname === "/teacher" || pathname.startsWith("/teacher/");
  if (isTeacherRoute && role !== "TEACHER") return "/";
  if (!isTeacherRoute && role === "TEACHER") return "/teacher";

  return null;
};
