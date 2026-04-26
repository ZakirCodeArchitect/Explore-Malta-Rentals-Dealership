import { VehicleType } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { enrichVehicleListWithRentalWindow } from "@/lib/vehicles/enrichVehicleListWithRentalWindow";
import { getVehicles, type GetVehiclesFilters } from "@/lib/vehicles";

const vehicleTypes = new Set<string>(Object.values(VehicleType));

function parseActiveFilter(activeRaw: string | null): boolean | undefined | null {
  if (activeRaw === null) {
    return undefined;
  }

  const normalized = activeRaw.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }

  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const typeRaw = url.searchParams.get("type");
  const activeRaw = url.searchParams.get("active");
  const pickupDate = url.searchParams.get("pickupDate")?.trim() ?? "";
  const pickupTime = url.searchParams.get("pickupTime")?.trim() ?? "";
  const returnDate = url.searchParams.get("returnDate")?.trim() ?? "";
  const returnTime = url.searchParams.get("returnTime")?.trim() ?? "";
  const sessionKey = url.searchParams.get("sessionKey")?.trim() ?? "";

  const filters: GetVehiclesFilters = {};

  if (typeRaw) {
    if (!vehicleTypes.has(typeRaw)) {
      return NextResponse.json(
        {
          success: false as const,
          message: "Invalid vehicle type filter",
        },
        { status: 400 },
      );
    }
    filters.type = typeRaw as GetVehiclesFilters["type"];
  }

  const activeFilter = parseActiveFilter(activeRaw);
  if (activeFilter === null) {
    return NextResponse.json(
      {
        success: false as const,
        message: "Invalid active filter. Use true or false.",
      },
      { status: 400 },
    );
  }
  if (activeFilter !== undefined) {
    filters.active = activeFilter;
  }

  try {
    const result = await getVehicles(filters);
    const hasFullRentalWindow =
      pickupDate.length > 0 &&
      pickupTime.length > 0 &&
      returnDate.length > 0 &&
      returnTime.length > 0;

    const vehicles = hasFullRentalWindow
      ? (
          await enrichVehicleListWithRentalWindow(result.vehicles, {
            pickupDate,
            pickupTime,
            returnDate,
            returnTime,
            viewerSessionKey: sessionKey || undefined,
          })
        ).filter((v) => v.rentalWindowStatus !== "unavailable")
      : result.vehicles;

    return NextResponse.json({
      success: true as const,
      vehicles,
    });
  } catch (error) {
    console.error("[vehicles] Failed to fetch vehicles", error);
    return NextResponse.json(
      {
        success: false as const,
        message: "Unable to load vehicles right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
