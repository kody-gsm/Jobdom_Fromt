"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession } from "../../../entities/user/index.ts";
import { getAuthRedirect } from "../model/routePolicy.ts";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
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
