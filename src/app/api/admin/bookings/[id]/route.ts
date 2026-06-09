import { NextResponse } from "next/server";

import { getAdminBookingById } from "@/lib/admin/bookings";
import { AdminUnauthorizedError, requireAdminApi } from "@/lib/admin-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminApi();
    const { id } = await context.params;

    const booking = await getAdminBookingById(id);
    if (!booking) {
      return NextResponse.json({ success: false as const, message: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true as const, booking });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }
}
