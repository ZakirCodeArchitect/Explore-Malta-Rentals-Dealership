/**
 * Client-safe types and default copy for booking control.
 * Server env resolution lives in `booking-control.ts` (import only from server / shared constants).
 */
export type BookingControlState = Readonly<{
  enabled: boolean;
  disabledMessage: string;
}>;

export const DEFAULT_BOOKING_DISABLED_MESSAGE =
  "Online booking is currently not available. It will be live in a few days. Please contact us via WhatsApp to reserve your vehicle." as const;

export function warnBookingActionBlocked(source: string): void {
  console.warn(`[booking] Blocked while online booking is disabled: ${source}`);
}
