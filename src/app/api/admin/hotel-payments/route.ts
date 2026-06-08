import { NextResponse } from "next/server";

import {
  adminHotelPaymentListQuerySchema,
  adminHotelPaymentWriteSchema,
  createAdminHotelPayment,
  DuplicateHotelSettlementError,
  DUPLICATE_HOTEL_SETTLEMENT_CODE,
  listAdminHotelPayments,
} from "@/lib/admin/hotel-payments";
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
    const parsed = adminHotelPaymentListQuerySchema.safeParse({
      hotelPartnerId: searchParams.get("hotelPartnerId") ?? undefined,
      month: searchParams.get("month") ?? undefined,
      year: searchParams.get("year") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false as const, message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const result = await listAdminHotelPayments(parsed.data);
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

    const parsed = adminHotelPaymentWriteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false as const, message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const settlement = await createAdminHotelPayment(parsed.data);
    return NextResponse.json({ success: true as const, settlement }, { status: 201 });
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
