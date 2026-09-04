"use client";

import { useEffect, useState } from "react";

export const useCountdown = (initialSeconds = 0) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(
      () => setSecondsLeft((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  return {
    secondsLeft,
    isExpired: secondsLeft <= 0,
    start: setSecondsLeft,
    reset: () => setSecondsLeft(0),
  };
};
