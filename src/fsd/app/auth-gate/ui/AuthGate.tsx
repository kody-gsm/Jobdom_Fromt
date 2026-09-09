"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getSession, isAccessTokenExpired } from "../../../entities/user/index.ts";
import { getAuthRedirect } from "../model/routePolicy.ts";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      const session = getSession();
      const isStudentRoute = !pathname.startsWith("/teacher") && !pathname.startsWith("/admin");
      if (isStudentRoute && session && isAccessTokenExpired(session.accessToken)) {
        clearSession();
      }
      const redirect = getAuthRedirect(pathname, getSession()?.role ?? null);
      if (redirect) {
        setAllowed(false);
        router.replace(redirect);
        return;
      }
      setAllowed(true);
    };

    checkAccess();
    window.addEventListener("jobdam-session", checkAccess);
    return () => window.removeEventListener("jobdam-session", checkAccess);
  }, [pathname, router]);

  if (!allowed) return null;
  return children;
};
