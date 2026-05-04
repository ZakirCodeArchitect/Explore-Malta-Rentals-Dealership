import { DEFAULT_BOOKING_DISABLED_MESSAGE } from "@/lib/booking-control-constants";

/** Parses `disabledMessage` from a 423 Locked JSON body (shared shape with POST guards). */
export function messageFromBookingLockedBody(
  body: unknown,
  fallback: string = DEFAULT_BOOKING_DISABLED_MESSAGE,
): string {
  if (body && typeof body === "object" && "disabledMessage" in body) {
    const raw = (body as { disabledMessage?: unknown }).disabledMessage;
    if (typeof raw === "string" && raw.trim().length > 0) {
      return raw.trim();
    }
  }
  return fallback;
}
