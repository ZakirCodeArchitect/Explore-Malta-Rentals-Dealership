/**
 * Toggle online booking UI and client-side API calls.
 * Set to `false` when the booking system goes live again.
 */
export const ONLINE_BOOKING_DISABLED = true;

export const BOOKING_UNAVAILABLE_GLOBAL_MESSAGE =
  "🚧 Online booking is currently not available. It will be live in a few days. Please check back soon or reach us through the contact page." as const;

export const BOOKING_FORM_DISABLED_BANNER =
  "Online booking is not supported yet, you can contact us directly." as const;

export const BOOKING_DISABLED_CTA_LABEL = "Online Booking Available Soon" as const;

/** Shown on disabled primary actions and API guard responses */
export const BOOKING_DISABLED_USER_HINT =
  "Online booking is temporarily unavailable. Please use the contact page to reach us." as const;

export function warnBookingActionBlocked(source: string): void {
  console.warn(`[booking] Blocked while online booking is disabled: ${source}`);
}
