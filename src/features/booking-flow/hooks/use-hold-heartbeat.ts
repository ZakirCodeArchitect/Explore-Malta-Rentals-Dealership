"use client";

import { useEffect } from "react";
import type { ReservationHoldStatus } from "@/features/booking-flow/lib/types";
import { heartbeatReservationHold } from "@/features/booking-flow/lib/reservation-hold-api";

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;

type UseHoldHeartbeatInput = {
  holdReference: string | null;
  status: ReservationHoldStatus | null;
  enabled: boolean;
  onHeartbeatSuccess: (nextExpiresAt: string, nextStatus: ReservationHoldStatus) => void;
  onHeartbeatExpired: (message: string) => void;
  onHeartbeatTransientError: (message: string) => void;
};

export function useHoldHeartbeat({
  holdReference,
  status,
  enabled,
  onHeartbeatSuccess,
  onHeartbeatExpired,
  onHeartbeatTransientError,
}: UseHoldHeartbeatInput) {
  useEffect(() => {
    if (!enabled || !holdReference || status !== "ACTIVE") {
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    const runHeartbeat = async () => {
      if (document.visibilityState === "hidden") {
        return;
      }
      const result = await heartbeatReservationHold(holdReference);
      if (cancelled) {
        return;
      }
      if (result.ok) {
        onHeartbeatSuccess(result.data.expiresAt, result.data.status);
        return;
      }
      const terminalState =
        result.status === 404 ||
        result.status === 409 ||
        result.holdStatus === "EXPIRED" ||
        result.holdStatus === "RELEASED" ||
        result.holdStatus === "CONVERTED";
      if (terminalState) {
        onHeartbeatExpired("Your reservation has expired. Please reserve the vehicle again.");
        return;
      }
      onHeartbeatTransientError(result.message);
    };

    const schedule = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(() => {
        void runHeartbeat();
      }, HEARTBEAT_INTERVAL_MS);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void runHeartbeat();
      }
    };

    schedule();
    void runHeartbeat();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      if (timer) {
        window.clearInterval(timer);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [
    enabled,
    holdReference,
    onHeartbeatExpired,
    onHeartbeatSuccess,
    onHeartbeatTransientError,
    status,
  ]);
}
