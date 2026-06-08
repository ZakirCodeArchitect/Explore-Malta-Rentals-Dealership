import { NextResponse } from "next/server";

import {
  adminHotelCodeListQuerySchema,
  adminHotelCodeWriteSchema,
  createAdminHotelCode,
  DuplicateHotelCodeError,
  InactiveHotelPartnerError,
  listAdminHotelCodes,
} from "@/lib/admin/hotel-codes";
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
    const parsed = adminHotelCodeListQuerySchema.safeParse({
      search: searchParams.get("search") ?? undefined,
      code: searchParams.get("code") ?? undefined,
      hotelPartnerId: searchParams.get("hotelPartnerId") ?? undefined,
      isActive: searchParams.get("isActive") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false as const, message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const result = await listAdminHotelCodes(parsed.data);
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

    const parsed = adminHotelCodeWriteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false as const, message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const code = await createAdminHotelCode(parsed.data);
    return NextResponse.json({ success: true as const, code }, { status: 201 });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof DuplicateHotelCodeError) {
      return NextResponse.json({ success: false as const, message: error.message }, { status: 409 });
    }
    if (error instanceof InactiveHotelPartnerError) {
      return NextResponse.json({ success: false as const, message: error.message }, { status: 400 });
    }
    throw error;
  }
}
