import type { BookingSubmissionInput } from "@/lib/booking/types";
import { messageFromBookingLockedBody } from "@/lib/booking-control-message";

export type BookingApiValidationError = {
  path: string;
  message: string;
};

export type SubmitBookingOk = {
  ok: true;
  bookingReference: string;
  message: string;
};

export type SubmitBookingErr = {
  ok: false;
  status: number;
  message: string;
  errors?: BookingApiValidationError[];
};

export type SubmitBookingResult = SubmitBookingOk | SubmitBookingErr;

type BookingsSuccessJson = {
  success: true;
  bookingReference: string;
  message?: string;
};

type BookingsErrorJson = {
  success: false;
  message?: string;
  errors?: BookingApiValidationError[];
};

export async function submitBooking(payload: BookingSubmissionInput): Promise<SubmitBookingResult> {
  let response: Response;
  try {
    response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[submitBooking] Network error", error);
    }
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
      message: "Unexpected response from server. Please try again.",
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
      message: "Unexpected response from server. Please try again.",
    };
  }

  if ((body as BookingsSuccessJson).success === true) {
    const data = body as BookingsSuccessJson;
    return {
      ok: true,
      bookingReference: data.bookingReference,
      message: data.message ?? "Booking submitted successfully",
    };
  }

  const err = body as BookingsErrorJson;
  const message =
    typeof err.message === "string" && err.message.trim().length > 0
      ? err.message
      : "Booking could not be submitted. Please review your details and try again.";

  if (process.env.NODE_ENV !== "production" && Array.isArray(err.errors)) {
    console.warn("[submitBooking] Validation errors", err.errors);
  }

  return {
    ok: false,
    status: response.status,
    message,
    errors: Array.isArray(err.errors) ? err.errors : undefined,
  };
}
