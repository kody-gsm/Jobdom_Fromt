"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { getSession } from "@fsd/entities/user";
import { tutorialApi } from "../api/tutorialApi.ts";
import { shouldRenderTutorialChildren } from "../model/presentation.ts";
import { getTutorialRole } from "../model/progress.ts";

const Tutorial = dynamic(() => import("./Tutorial.tsx").then((module) => module.Tutorial));
const PUBLIC_PATHS = new Set(["/login", "/signup", "/forgot-password"]);
// 완료가 확인된 계정은 탭이 살아 있는 동안 다시 조회하지 않는다.
const completedUsers = new Set<number>();

type TutorialStatus = { userId: number; isCompleted: boolean };

const getSnapshot = () => {
  const session = getSession();
  const role = getTutorialRole(session?.role);
  return session && role ? `${session.userId}:${role}` : "none";
};

const subscribe = (onChange: () => void) => {
  window.addEventListener("jobdam-session", onChange);
  return () => window.removeEventListener("jobdam-session", onChange);
};

const getServerSnapshot = () => "loading";

export const RoleTutorialGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [status, setStatus] = useState<TutorialStatus | null>(null);
  const session = snapshot === "loading" || snapshot === "none" ? null : getSession();
  const role = getTutorialRole(session?.role);
  const userId = session && role ? session.userId : null;

  useEffect(() => {
    if (userId === null || completedUsers.has(userId)) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const isCompleted = await tutorialApi.isCompleted(controller.signal);
        if (controller.signal.aborted) return;
        if (isCompleted) completedUsers.add(userId);
        setStatus({ userId, isCompleted });
      } catch {
        // 상태 조회 실패로 서비스 이용을 막지 않는다. 캐시하지 않으므로 다음 진입 때 다시 확인한다.
        if (!controller.signal.aborted) setStatus({ userId, isCompleted: true });
      }
    };
    void load();
    return () => controller.abort();
  }, [userId]);

  if (PUBLIC_PATHS.has(pathname)) return children;
  if (snapshot === "loading") return children;
  if (userId === null || !role || completedUsers.has(userId)) return children;
  const presentationState = status?.userId !== userId
    ? "loading"
    : status.isCompleted
      ? "completed"
      : "tutorial";
  if (shouldRenderTutorialChildren(presentationState)) return children;

  const handleComplete = async () => {
    await tutorialApi.complete();
    completedUsers.add(userId);
    setStatus({ userId, isCompleted: true });
  };

  return <Tutorial key={snapshot} role={role} onComplete={handleComplete} />;
};
