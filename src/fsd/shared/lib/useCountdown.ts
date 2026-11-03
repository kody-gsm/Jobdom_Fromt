"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCountdownSecondsLeft } from "./countdown.ts";

export const useCountdown = (initialSeconds = 0) => {
  const [deadline, setDeadline] = useState<number | null>(
    () => initialSeconds > 0 ? Date.now() + initialSeconds * 1000 : null,
  );
  const deadlineRef = useRef(deadline);
  const [secondsLeft, setSecondsLeft] = useState(() => getCountdownSecondsLeft(deadline));
  const isRunning = secondsLeft > 0;

  const refresh = useCallback(() => {
    const remaining = getCountdownSecondsLeft(deadlineRef.current);
    setSecondsLeft(remaining);
    return remaining;
  }, []);

  const start = useCallback((seconds: number) => {
    deadlineRef.current = seconds > 0 ? Date.now() + seconds * 1000 : null;
    setDeadline(deadlineRef.current);
    refresh();
  }, [refresh]);

  const reset = useCallback(() => start(0), [start]);
  const checkExpired = useCallback(() => refresh() <= 0, [refresh]);

  useEffect(() => {
    if (deadline === null || !isRunning) return;
    const update = () => { refresh(); };
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const timer = window.setInterval(update, 1000);
    window.addEventListener("focus", update);
    window.addEventListener("pageshow", update);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
      window.removeEventListener("pageshow", update);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [deadline, isRunning, refresh]);

  return {
    secondsLeft,
    isExpired: secondsLeft <= 0,
    checkExpired,
    start,
    reset,
  };
};
