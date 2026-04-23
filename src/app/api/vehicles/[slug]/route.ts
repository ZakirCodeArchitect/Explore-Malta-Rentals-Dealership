import { NextResponse } from "next/server";

import { getVehicleBySlug } from "@/lib/vehicles";

type RouteContext = {
  params: Promise<{
    slug?: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  const slug = params.slug?.trim();

  if (!slug) {
    return NextResponse.json(
      {
        success: false as const,
        message: "Vehicle not found",
      },
      { status: 404 },
    );
  }

  try {
    const result = await getVehicleBySlug(slug);
    if (!result.vehicle) {
      return NextResponse.json(
        {
          success: false as const,
          message: "Vehicle not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true as const,
      vehicle: result.vehicle,
    });
  } catch (error) {
    console.error("[vehicles] Failed to fetch vehicle by slug", { slug, error });
    return NextResponse.json(
      {
        success: false as const,
        message: "Unable to load vehicle right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
