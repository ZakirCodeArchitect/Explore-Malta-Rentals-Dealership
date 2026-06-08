import { NextResponse } from "next/server";

import {
  adminVehicleWriteSchema,
  deactivateAdminVehicle,
  deleteAdminVehicle,
  DuplicateLicensePlateError,
  getAdminVehicleById,
  updateAdminVehicle,
} from "@/lib/admin/vehicles";
import { AdminUnauthorizedError, requireAdminApi } from "@/lib/admin-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function formatZodError(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const fieldErrors = error.flatten().fieldErrors;
  const firstKey = Object.keys(fieldErrors)[0];
  const firstMessage = firstKey ? fieldErrors[firstKey]?.[0] : undefined;
  return firstMessage ?? "Invalid request";
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminApi();
    const { id } = await context.params;
    const vehicle = await getAdminVehicleById(id);

    if (!vehicle) {
      return NextResponse.json({ success: false as const, message: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true as const, vehicle });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminApi();
    const { id } = await context.params;

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

    const vehicle = await updateAdminVehicle(id, parsed.data);
    if (!vehicle) {
      return NextResponse.json({ success: false as const, message: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true as const, vehicle });
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

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminApi();
    const { id } = await context.params;
    const result = await deleteAdminVehicle(id);

    if (!result.ok) {
      if (result.reason === "has_related_records") {
        return NextResponse.json(
          {
            success: false as const,
            message:
              "This vehicle has booking history and cannot be deleted. You can deactivate it instead.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json({ success: false as const, message: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true as const });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }
}
