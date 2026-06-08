import { NextResponse } from "next/server";

import {
  adminHotelPaymentWriteSchema,
  DuplicateHotelSettlementError,
  DUPLICATE_HOTEL_SETTLEMENT_CODE,
  getAdminHotelPaymentById,
  updateAdminHotelPayment,
} from "@/lib/admin/hotel-payments";
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
    const settlement = await getAdminHotelPaymentById(id);

    if (!settlement) {
      return NextResponse.json({ success: false as const, message: "Settlement not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true as const, settlement });
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

    const parsed = adminHotelPaymentWriteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false as const, message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const settlement = await updateAdminHotelPayment(id, parsed.data);
    if (!settlement) {
      return NextResponse.json({ success: false as const, message: "Settlement not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true as const, settlement });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof DuplicateHotelSettlementError) {
      return NextResponse.json(
        {
          success: false as const,
          code: DUPLICATE_HOTEL_SETTLEMENT_CODE,
          message: error.message,
        },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message === "Hotel not found") {
      return NextResponse.json({ success: false as const, message: error.message }, { status: 404 });
    }
    throw error;
  }
}
