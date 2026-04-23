"use client";

import { useEffect, useMemo, useState } from "react";

const ONE_SECOND_MS = 1000;

function formatRemaining(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export function useHoldCountdown(expiresAt: string | null, isActive: boolean) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!isActive || !expiresAt) {
      return;
    }
    const timer = window.setInterval(() => setNowMs(Date.now()), ONE_SECOND_MS);
    return () => window.clearInterval(timer);
  }, [expiresAt, isActive]);

  return useMemo(() => {
    if (!expiresAt || !isActive) {
      return {
        remainingMs: 0,
        remainingLabel: null as string | null,
        isExpired: false,
      };
    }
    const expiresMs = new Date(expiresAt).getTime();
    const remainingMs = Math.max(0, expiresMs - nowMs);
    const totalSeconds = Math.ceil(remainingMs / 1000);
    return {
      remainingMs,
      remainingLabel: formatRemaining(totalSeconds),
      isExpired: remainingMs <= 0,
    };
  }, [expiresAt, isActive, nowMs]);
}
