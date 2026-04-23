export const RESERVATION_HOLD_STORAGE_KEY = "explore-malta-rentals:reservation-hold";

/**
 * Session key from an active stored hold, for listing APIs to distinguish your hold vs others'.
 * Per-vehicle classification still uses the listing rental window vs hold overlap in the DB.
 */
export function readReservationHoldSessionKeyFromStorage(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const raw = window.sessionStorage.getItem(RESERVATION_HOLD_STORAGE_KEY);
  if (!raw) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const holdReference = typeof parsed.holdReference === "string" ? parsed.holdReference.trim() : "";
    const sessionKey = typeof parsed.sessionKey === "string" ? parsed.sessionKey.trim() : "";
    if (!holdReference || !sessionKey) {
      return undefined;
    }
    return sessionKey;
  } catch {
    return undefined;
  }
}
