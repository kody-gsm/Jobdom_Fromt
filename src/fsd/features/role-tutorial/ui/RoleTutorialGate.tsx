"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { getSession } from "@fsd/entities/user";
import { getTutorialRole, getTutorialStorageKey, readTutorialCompletion, saveTutorialCompletion } from "../model/progress.ts";

const Tutorial = dynamic(() => import("./Tutorial.tsx").then((module) => module.Tutorial));
const COMPLETION_EVENT = "jobdam-tutorial-completed";
const completedInMemory = new Set<string>();
const PUBLIC_PATHS = new Set(["/login", "/signup", "/forgot-password"]);

const getBrowserStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const getSnapshot = () => {
  const session = getSession();
  const role = getTutorialRole(session?.role);
  if (!session || !role) return "ready";
  const key = getTutorialStorageKey(session.userId, role);
  const isCompleted = completedInMemory.has(key) || readTutorialCompletion(getBrowserStorage(), key);
  return `${key}:${isCompleted ? "completed" : "pending"}`;
};

const subscribe = (onChange: () => void) => {
  window.addEventListener("jobdam-session", onChange);
  window.addEventListener("storage", onChange);
  window.addEventListener(COMPLETION_EVENT, onChange);
  return () => {
    window.removeEventListener("jobdam-session", onChange);
    window.removeEventListener("storage", onChange);
    window.removeEventListener(COMPLETION_EVENT, onChange);
  };
};

const getServerSnapshot = () => "loading";

export const RoleTutorialGate = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (PUBLIC_PATHS.has(pathname)) return children;
  if (snapshot === "loading") return null;
  if (snapshot === "ready" || snapshot.endsWith(":completed")) return children;

  const session = getSession();
  const role = getTutorialRole(session?.role);
  if (!session || !role) return null;
  const completionKey = getTutorialStorageKey(session.userId, role);

  const handleComplete = () => {
    // 저장소가 차단된 브라우저에서도 현재 탭에서는 완료 상태를 유지한다.
    completedInMemory.add(completionKey);
    saveTutorialCompletion(getBrowserStorage(), completionKey);
    window.dispatchEvent(new Event(COMPLETION_EVENT));
  };

  return <Tutorial key={completionKey} role={role} onComplete={handleComplete} />;
};
