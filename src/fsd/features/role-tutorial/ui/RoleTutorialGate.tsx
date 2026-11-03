"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { getSession } from "@fsd/entities/user";
import { tutorialApi } from "../api/tutorialApi.ts";
import { getStatusRetryKey, getTutorialMode, type TutorialStatusState } from "../model/presentation.ts";
import { getTutorialRole } from "../model/progress.ts";
import { subscribeTutorialReplay } from "../model/replay.ts";

const Tutorial = dynamic(() => import("./Tutorial.tsx").then((module) => module.Tutorial));
const PUBLIC_PATHS = new Set(["/login", "/signup", "/forgot-password"]);
// 완료가 확인된 계정은 탭이 살아 있는 동안 다시 조회하지 않는다.
const completedUsers = new Set<number>();

type TutorialStatus = { userId: number; state: TutorialStatusState };

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
  const [replayUserId, setReplayUserId] = useState<number | null>(null);
  const session = snapshot === "loading" || snapshot === "none" ? null : getSession();
  const role = getTutorialRole(session?.role);
  const userId = session && role ? session.userId : null;
  const currentUserId = useRef(userId);
  const statusState = userId !== null && completedUsers.has(userId)
    ? "completed"
    : status?.userId === userId ? status.state : null;
  const retryKey = getStatusRetryKey(statusState, pathname);

  useEffect(() => {
    currentUserId.current = userId;
  }, [userId]);

  useEffect(() => subscribeTutorialReplay(() => setReplayUserId(currentUserId.current)), []);

  useEffect(() => {
    if (userId === null || completedUsers.has(userId)) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        const isCompleted = await tutorialApi.isCompleted(controller.signal);
        if (controller.signal.aborted) return;
        if (isCompleted) completedUsers.add(userId);
        setStatus({ userId, state: isCompleted ? "completed" : "pending" });
      } catch {
        // 상태 조회 실패로 서비스 이용을 막지 않는다. 다른 화면으로 이동하면 다시 확인한다.
        if (!controller.signal.aborted) setStatus({ userId, state: "failed" });
      }
    };
    void load();
    return () => controller.abort();
  }, [userId, retryKey]);

  const isPublicPath = PUBLIC_PATHS.has(pathname);
  const mode = isPublicPath || userId === null || !role
    ? null
    : getTutorialMode(statusState, replayUserId === userId);

  const handleComplete = async () => {
    if (mode === "first-run" && userId !== null) {
      await tutorialApi.complete();
      completedUsers.add(userId);
      setStatus({ userId, state: "completed" });
    }
    setReplayUserId(null);
  };

  // 실제 화면은 항상 같은 위치에 렌더링해서 안내가 열리고 닫혀도 다시 마운트되지 않게 한다.
  return (
    <>
      <div className="contents" inert={mode !== null}>{children}</div>
      {mode !== null && role ? <Tutorial key={`${snapshot}:${mode}`} role={role} mode={mode} onComplete={handleComplete} /> : null}
    </>
  );
};
