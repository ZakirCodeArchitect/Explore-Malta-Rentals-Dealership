import { NextResponse } from "next/server";

import { releaseReservationHold } from "@/lib/reservation-holds";

type RouteContext = {
  params: Promise<{
    holdReference?: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
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
    const result = await releaseReservationHold(holdReference);

    return NextResponse.json({
      success: true as const,
      released: result.released,
      holdReference,
      status: result.hold?.status ?? "EXPIRED",
      expiresAt: result.hold?.expiresAt ?? null,
      message: result.released
        ? "Reservation hold released"
        : "Reservation hold already inactive",
    });
  } catch (error) {
    console.error("[reservation-holds] Failed to release hold", { holdReference, error });
    return NextResponse.json(
      {
        success: false as const,
        message: "Unable to release reservation hold right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
