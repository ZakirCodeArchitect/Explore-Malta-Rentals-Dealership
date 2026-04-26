import { NextResponse } from "next/server";
import {
  AvailabilityConflictError,
  submitBooking,
  SubmitBookingValidationError,
  type BookingSubmissionInput,
} from "@/lib/booking";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false as const,
        errors: [{ path: "$", message: "Invalid JSON payload" }],
      },
      { status: 400 },
    );
  }

  try {
    const result = await submitBooking(payload as BookingSubmissionInput);

    return NextResponse.json({
      success: true as const,
      bookingReference: result.bookingReference,
      message: "Booking submitted successfully",
    });
  } catch (error) {
    if (error instanceof SubmitBookingValidationError) {
      return NextResponse.json(
        {
          success: false as const,
          errors: error.errors,
        },
        { status: 400 },
      );
    }
    if (error instanceof AvailabilityConflictError) {
      return NextResponse.json(
        {
          success: false as const,
          message: error.message,
        },
        { status: 409 },
      );
    }
    console.error("[bookings] Failed to submit booking", error);
    return NextResponse.json(
      {
        success: false as const,
        message: "Unable to submit booking right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
