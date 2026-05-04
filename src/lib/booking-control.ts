import "server-only";

import { NextResponse } from "next/server";

import {
  DEFAULT_BOOKING_DISABLED_MESSAGE,
  type BookingControlState,
} from "@/lib/booking-control-constants";

function parseBookingEnabled(raw: string | undefined): boolean {
  if (raw === undefined || raw.trim() === "") {
    return false;
  }
  const normalized = raw.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }
  return false;
}

/**
 * Central server-side booking switch: env-driven, no admin UI.
 * `BOOKING_ENABLED` default false keeps the site in the same “bookings off” posture as before.
 */
export function getBookingControl(): BookingControlState {
  const enabled = parseBookingEnabled(process.env.BOOKING_ENABLED);
  const disabledMessage =
    process.env.BOOKING_DISABLED_MESSAGE?.trim() || DEFAULT_BOOKING_DISABLED_MESSAGE;
  return { enabled, disabledMessage };
}

/** Use at the start of route handlers: return this response when non-null. */
export function assertBookingEnabledOr423(): NextResponse | null {
  const control = getBookingControl();
  if (control.enabled) {
    return null;
  }
  return NextResponse.json({ disabledMessage: control.disabledMessage }, { status: 423 });
}
