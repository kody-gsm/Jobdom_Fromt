"use client";

import { useEffect, useMemo, useState } from "react";

const MAX_TIMER_DELAY = 2_147_483_647;

// Match deadline.ts: date-only deadlines include the entire local day and
// backend nanoseconds are truncated to JavaScript's millisecond precision.
const deadlineTime = (deadline: string | null | undefined) => {
  const value = deadline?.trim();
  if (!value) return NaN;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T23:59:59.999`
    : value.replace(/(\.\d{3})\d+/, "$1");
  return new Date(normalized).getTime();
};

export const useDeadlineClock = (deadlines: readonly (string | null | undefined)[]) => {
  const [timestamp, setTimestamp] = useState(() => Date.now());
  const deadlineKey = deadlines.map(deadlineTime).filter(Number.isFinite).sort((a, b) => a - b).join(",");

  useEffect(() => {
    const times = deadlineKey ? deadlineKey.split(",").map(Number) : [];
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = (now: number) => {
      if (timer !== undefined) clearTimeout(timer);
      const next = times.find((time) => time >= now);
      if (next === undefined) return;
      timer = setTimeout(() => {
        if (!active) return;
        const current = Date.now();
        if (current > next) setTimestamp(current);
        schedule(current);
      }, Math.min(next - now + 1, MAX_TIMER_DELAY));
    };
    const refresh = () => {
      if (!active) return;
      const current = Date.now();
      setTimestamp(current);
      schedule(current);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    queueMicrotask(refresh);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      active = false;
      if (timer !== undefined) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, [deadlineKey]);

  return useMemo(() => new Date(timestamp), [timestamp]);
};
