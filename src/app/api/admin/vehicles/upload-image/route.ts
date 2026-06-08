import { NextResponse } from "next/server";
import { z } from "zod";

import { uploadAdminVehicleImage } from "@/lib/admin/vehicles";
import { AdminUnauthorizedError, requireAdminApi } from "@/lib/admin-auth";
import { UploadRejectedError } from "@/lib/uploads/errors";

const uploadQuerySchema = z.object({
  vehicleSlug: z.string().trim().min(1).max(120),
});

export async function POST(request: Request) {
  try {
    await requireAdminApi();

    const { searchParams } = new URL(request.url);
    const parsedQuery = uploadQuerySchema.safeParse({
      vehicleSlug: searchParams.get("vehicleSlug") ?? "",
    });

    if (!parsedQuery.success) {
      return NextResponse.json({ success: false as const, message: "Vehicle slug is required" }, { status: 400 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ success: false as const, message: "Invalid upload payload" }, { status: 400 });
    }

    const fileEntries = formData.getAll("file");
    if (fileEntries.length !== 1) {
      return NextResponse.json(
        { success: false as const, message: "Exactly one file must be uploaded" },
        { status: 400 },
      );
    }

    const file = fileEntries[0];
    const uploaded = await uploadAdminVehicleImage(file instanceof File ? file : null, parsedQuery.data.vehicleSlug);

    return NextResponse.json({
      success: true as const,
      file: uploaded,
    });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof UploadRejectedError) {
      return NextResponse.json({ success: false as const, message: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message.includes("Missing required environment variable")) {
      return NextResponse.json(
        { success: false as const, message: "Upload service is not configured" },
        { status: 500 },
      );
    }
    throw error;
  }
}
