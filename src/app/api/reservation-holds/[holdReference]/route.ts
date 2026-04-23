import { NextResponse } from "next/server";

import {
  getReservationHoldByReference,
  toReservationHoldStatusResponse,
} from "@/lib/reservation-holds";

type RouteContext = {
  params: Promise<{
    holdReference?: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { holdReference: holdReferenceRaw } = await context.params;
  const holdReference = holdReferenceRaw?.trim();

  if (!holdReference) {
    return NextResponse.json(
      {
        success: false as const,
        message: "Hold reference is required",
      },
      { status: 400 },
    );
  }

  try {
    const hold = await getReservationHoldByReference(holdReference);
    if (!hold) {
      return NextResponse.json(
        {
          success: false as const,
          message: "Reservation hold not found",
        },
        { status: 404 },
      );
    }

    const status = toReservationHoldStatusResponse(hold);
    return NextResponse.json({
      success: true as const,
      holdReference: status.holdReference,
      status: status.status,
      expiresAt: status.expiresAt,
      reservedAt: status.reservedAt,
      remainingSeconds: status.remainingSeconds,
      vehicleId: status.vehicleId,
      vehicleType: status.vehicleType,
    });
  } catch (error) {
    console.error("[reservation-holds] Failed to fetch hold", { holdReference, error });
    return NextResponse.json(
      {
        success: false as const,
        message: "Unable to fetch reservation hold right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
