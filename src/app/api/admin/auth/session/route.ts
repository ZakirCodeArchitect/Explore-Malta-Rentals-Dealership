import { NextResponse } from "next/server";

import { AdminUnauthorizedError, requireAdminApi } from "@/lib/admin-auth";

export async function GET() {
  try {
    const session = await requireAdminApi();
    return NextResponse.json({
      success: true as const,
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
      },
    });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }
}
