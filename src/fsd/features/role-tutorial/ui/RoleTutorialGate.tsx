"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { getSession } from "@fsd/entities/user";
import { tutorialApi } from "../api/tutorialApi.ts";
import { getStatusRetryKey, getTutorialMode, type TutorialStatusState } from "../model/presentation.ts";
import { getTutorialRole } from "../model/progress.ts";
import { subscribeTutorialReplay } from "../model/replay.ts";
import { getPracticeKey, startPractice, stopPractice, subscribePractice } from "../model/practiceSession.ts";

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

  const practiceKey = useSyncExternalStore(subscribePractice, getPracticeKey, () => null);
  const desiredPracticeKey = mode !== null && userId !== null && role ? `${snapshot}:${mode}` : null;
  const practiceName = session?.name ?? "";

  // 안내가 열려 있는 동안만 연습용 서버를 켠다. 켜고 꺼질 때 화면을 새로 그려서 실제 데이터와 섞이지 않게 한다.
  useEffect(() => {
    if (desiredPracticeKey === null || userId === null || !role) return;
    startPractice(desiredPracticeKey, { userId, name: practiceName, role });
    return () => stopPractice();
  }, [desiredPracticeKey, practiceName, role, userId]);

  const handleComplete = async () => {
    if (mode === "first-run" && userId !== null) {
      await tutorialApi.complete();
      completedUsers.add(userId);
      setStatus({ userId, state: "completed" });
    }
    setReplayUserId(null);
  };

  // 연습 모드가 바뀌면 key가 바뀌어 화면이 새 데이터(연습용 ↔ 실제)로 다시 그려진다.
  const isPracticing = practiceKey !== null && practiceKey === desiredPracticeKey;
  return (
    <>
      <div key={practiceKey ?? "live"} className="contents">{children}</div>
      {isPracticing && mode !== null && role ? <Tutorial key={practiceKey} role={role} mode={mode} onComplete={handleComplete} /> : null}
    </>
  );
};
