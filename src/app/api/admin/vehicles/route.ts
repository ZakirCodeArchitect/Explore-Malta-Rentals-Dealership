import { NextResponse } from "next/server";

import {
  adminVehicleListQuerySchema,
  adminVehicleWriteSchema,
  createAdminVehicle,
  DuplicateLicensePlateError,
  listAdminVehicles,
} from "@/lib/admin/vehicles";
import type { VehicleCatalogStatus, VehicleType } from "@/generated/prisma/client";
import { AdminUnauthorizedError, requireAdminApi } from "@/lib/admin-auth";

function formatZodError(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const fieldErrors = error.flatten().fieldErrors;
  const firstKey = Object.keys(fieldErrors)[0];
  const firstMessage = firstKey ? fieldErrors[firstKey]?.[0] : undefined;
  return firstMessage ?? "Invalid request";
}

export async function GET(request: Request) {
  try {
    await requireAdminApi();

    const { searchParams } = new URL(request.url);
    const parsed = adminVehicleListQuerySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      vehicleType: searchParams.get("vehicleType") ?? undefined,
      catalogStatus: searchParams.get("catalogStatus") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false as const, message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const result = await listAdminVehicles({
      search: parsed.data.search,
      vehicleType: parsed.data.vehicleType as VehicleType | undefined,
      catalogStatus: parsed.data.catalogStatus as VehicleCatalogStatus | undefined,
    });
    return NextResponse.json({ success: true as const, ...result });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminApi();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false as const, message: "Invalid request body" }, { status: 400 });
    }

    const parsed = adminVehicleWriteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false as const, message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const vehicle = await createAdminVehicle(parsed.data);
    return NextResponse.json({ success: true as const, vehicle }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof DuplicateLicensePlateError) {
      return NextResponse.json({ success: false as const, message: error.message }, { status: 409 });
    }
    throw error;
  }
}
