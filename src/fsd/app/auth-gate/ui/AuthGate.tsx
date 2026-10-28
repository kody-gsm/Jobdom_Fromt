"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, recordPageView } from "@fsd/entities/user";
import { RoleTutorialGate } from "@fsd/features/role-tutorial";
import { shouldRenderAuthChildren, type AuthGateStatus } from "../model/authGatePresentation.ts";
import { getAuthRedirect } from "../model/routePolicy.ts";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<AuthGateStatus>("checking");
  const lastVisit = useRef("");

  useEffect(() => {
    const checkAccess = () => {
      const session = getSession();
      const redirect = getAuthRedirect(pathname, session?.role ?? null);
      if (redirect) {
        lastVisit.current = "";
        setStatus("redirecting");
        router.replace(redirect);
        return;
      }
      const visit = session ? `${session.userId}:${pathname}` : "";
      if (visit && visit !== lastVisit.current) recordPageView(pathname);
      lastVisit.current = visit;
      setStatus("allowed");
    };

    checkAccess();
    window.addEventListener("jobdam-session", checkAccess);
    return () => window.removeEventListener("jobdam-session", checkAccess);
  }, [pathname, router]);

  if (!shouldRenderAuthChildren(status)) return null;
  return <RoleTutorialGate>{children}</RoleTutorialGate>;
};
