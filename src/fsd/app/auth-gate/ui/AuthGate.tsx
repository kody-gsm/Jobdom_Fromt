"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, recordPageView } from "@fsd/entities/user";
import { RoleTutorialGate } from "@fsd/features/role-tutorial";
import { getAuthRedirect } from "../model/routePolicy.ts";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [allowedPath, setAllowedPath] = useState<string | null>(null);
  const lastVisit = useRef("");

  useEffect(() => {
    const checkAccess = () => {
      const session = getSession();
      const redirect = getAuthRedirect(pathname, session?.role ?? null);
      if (redirect) {
        lastVisit.current = "";
        setAllowedPath(null);
        router.replace(redirect);
        return;
      }
      const visit = session ? `${session.userId}:${pathname}` : "";
      if (visit && visit !== lastVisit.current) recordPageView(pathname);
      lastVisit.current = visit;
      setAllowedPath(pathname);
    };

    checkAccess();
    window.addEventListener("jobdam-session", checkAccess);
    return () => window.removeEventListener("jobdam-session", checkAccess);
  }, [pathname, router]);

  if (allowedPath !== pathname) return null;
  return <RoleTutorialGate>{children}</RoleTutorialGate>;
};
