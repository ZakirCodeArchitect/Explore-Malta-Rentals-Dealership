import { NextResponse } from "next/server";

import { adminBookingStatusUpdateSchema, updateAdminBookingStatus } from "@/lib/admin/bookings";
import type { BookingStatus } from "@/generated/prisma/client";
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

    const parsed = adminBookingStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false as const, message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const result = await updateAdminBookingStatus(
      id,
      parsed.data.status as BookingStatus,
      session.id,
      parsed.data.note,
    );

    if (!result.ok) {
      if (result.reason === "not_found") {
        return NextResponse.json({ success: false as const, message: "Booking not found" }, { status: 404 });
      }
      return NextResponse.json(
        { success: false as const, message: "Booking is already in that status." },
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
