import { NextResponse } from "next/server";

import {
  adminReportQuerySchema,
  getAdminReportsSummary,
} from "@/lib/admin/reports";
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
    const parsed = adminReportQuerySchema.safeParse({
      month: searchParams.get("month") ?? undefined,
      year: searchParams.get("year") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      hotelPartnerId: searchParams.get("hotelPartnerId") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false as const, message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const summary = await getAdminReportsSummary(parsed.data);
    return NextResponse.json({ success: true as const, summary });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }
}
