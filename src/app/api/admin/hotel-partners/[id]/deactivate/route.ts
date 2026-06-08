import { NextResponse } from "next/server";

import { deactivateAdminHotelPartner } from "@/lib/admin/hotel-partners";
import { AdminUnauthorizedError, requireAdminApi } from "@/lib/admin-auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    await requireAdminApi();
    const { id } = await context.params;
    const result = await deactivateAdminHotelPartner(id);

    if (!result.ok) {
      return NextResponse.json({ success: false as const, message: "Hotel partner not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true as const, partner: result.partner });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }
}
