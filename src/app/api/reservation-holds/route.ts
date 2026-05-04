import { NextResponse } from "next/server";

import {
  createReservationHold,
  ReservationHoldConflictError,
  ReservationHoldValidationError,
} from "@/lib/reservation-holds";
import { assertBookingEnabledOr423 } from "@/lib/booking-control";

export async function POST(request: Request) {
  const locked = assertBookingEnabledOr423();
  if (locked) {
    return locked;
  }

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
    const hold = await createReservationHold(payload);

    return NextResponse.json({
      success: true as const,
      holdReference: hold.holdReference,
      sessionKey: hold.sessionKey,
      expiresAt: hold.expiresAt,
      status: hold.status,
      message: "Vehicle reserved temporarily",
    });
  } catch (error) {
    if (error instanceof ReservationHoldValidationError) {
      return NextResponse.json(
        {
          success: false as const,
          errors: error.errors,
        },
        { status: 400 },
      );
    }
    if (error instanceof ReservationHoldConflictError) {
      return NextResponse.json(
        {
          success: false as const,
          message: error.message,
        },
        { status: 409 },
      );
    }

    console.error("[reservation-holds] Failed to create hold", error);
    return NextResponse.json(
      {
        success: false as const,
        message: "Unable to reserve vehicle right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
