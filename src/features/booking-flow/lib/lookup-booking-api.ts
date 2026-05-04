import type { PublicBookingSummary } from "@/lib/booking/lookupPublicBooking";
import { messageFromBookingLockedBody } from "@/lib/booking-control-message";

export type LookupBookingOk = {
  ok: true;
  booking: PublicBookingSummary;
};

export type LookupBookingErr = {
  ok: false;
  status: number;
  message: string;
};

export type LookupBookingResult = LookupBookingOk | LookupBookingErr;

type LookupSuccessJson = {
  success: true;
  booking: PublicBookingSummary;
};

type LookupErrorJson = {
  success: false;
  message?: string;
};

export async function lookupBooking(reference: string, email: string): Promise<LookupBookingResult> {
  let response: Response;
  try {
    response = await fetch("/api/bookings/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, email }),
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Unable to reach the server. Check your connection and try again.",
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      status: response.status,
      message: "Unexpected response from the server. Please try again.",
    };
  }

  if (response.status === 423) {
    return {
      ok: false,
      status: 423,
      message: messageFromBookingLockedBody(body),
    };
  }

  if (!body || typeof body !== "object" || !("success" in body)) {
    return {
      ok: false,
      status: response.status,
      message: "Unexpected response from the server. Please try again.",
    };
  }

  if ((body as LookupSuccessJson).success === true) {
    const data = body as LookupSuccessJson;
    return { ok: true, booking: data.booking };
  }

  const err = body as LookupErrorJson;
  const message =
    typeof err.message === "string" && err.message.trim().length > 0
      ? err.message.trim()
      : "No booking was found with those details.";

  return { ok: false, status: response.status, message };
}
