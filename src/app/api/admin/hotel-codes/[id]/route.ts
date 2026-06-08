import { NextResponse } from "next/server";

import {
  adminHotelCodeWriteSchema,
  deleteAdminHotelCode,
  DuplicateHotelCodeError,
  getAdminHotelCodeById,
  InactiveHotelPartnerError,
  updateAdminHotelCode,
} from "@/lib/admin/hotel-codes";
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
    const code = await getAdminHotelCodeById(id);

    if (!code) {
      return NextResponse.json({ success: false as const, message: "Hotel code not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true as const, code });
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

    const parsed = adminHotelCodeWriteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false as const, message: formatZodError(parsed.error) },
        { status: 400 },
      );
    }

    const code = await updateAdminHotelCode(id, parsed.data);
    if (!code) {
      return NextResponse.json({ success: false as const, message: "Hotel code not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true as const, code });
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

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminApi();
    const { id } = await context.params;
    const result = await deleteAdminHotelCode(id);

    if (!result.ok) {
      if (result.reason === "not_found") {
        return NextResponse.json({ success: false as const, message: "Hotel code not found" }, { status: 404 });
      }
      return NextResponse.json(
        {
          success: false as const,
          message: "Cannot delete a hotel code with booking history. Deactivate instead.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true as const });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }
}
