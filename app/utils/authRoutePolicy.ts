export type AuthRole = "STUDENT" | "TEACHER";

const PUBLIC_ROUTES = new Set(["/login", "/signup", "/forgot-password"]);

export const isPublicRoute = (pathname: string) => PUBLIC_ROUTES.has(pathname);

export const getAuthRedirect = (
  pathname: string,
  role: AuthRole | null,
): string | null => {
  if (isPublicRoute(pathname)) return null;
  if (!role) return "/login";

  const isTeacherRoute = pathname === "/teacher" || pathname.startsWith("/teacher/");
  if (isTeacherRoute && role !== "TEACHER") return "/";
  if (!isTeacherRoute && role === "TEACHER") return "/teacher";

  return null;
};
