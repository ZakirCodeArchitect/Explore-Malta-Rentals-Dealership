import { NextResponse } from "next/server";

import { formatZodError } from "@/lib/admin/bookings/format-zod-error";
import { markVehicleReturned, markVehicleReturnedSchema } from "@/lib/admin/bookings/lifecycle";
import { AdminUnauthorizedError, requireAdminApi } from "@/lib/admin-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function lifecycleConflictMessage(reason: string): string {
  switch (reason) {
    case "invalid_status":
      return "This action is not allowed for the current booking status.";
    case "missing_vehicle_unit":
      return "Booking does not have an assigned vehicle unit.";
    default:
      return "Unable to perform this action.";
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireAdminApi();
    const { id } = await context.params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false as const, message: "Invalid request body" }, { status: 400 });
    }

    const parsed = markVehicleReturnedSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false as const, message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const result = await markVehicleReturned(id, parsed.data, session.id);
    if (!result.ok) {
      if (result.reason === "not_found") {
        return NextResponse.json({ success: false as const, message: "Booking not found" }, { status: 404 });
      }
      return NextResponse.json(
        { success: false as const, message: lifecycleConflictMessage(result.reason) },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true as const, booking: result.booking });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }
}
