import { NextResponse } from "next/server";

import { assertBookingEnabledOr423 } from "@/lib/booking-control";
import { UploadRejectedError } from "@/lib/uploads/errors";
import { uploadFile } from "@/lib/uploads/uploadService";
import { isUploadCategory } from "@/lib/uploads/validators";

export const runtime = "nodejs";

function readOptionalFormString(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function POST(request: Request) {
  const locked = assertBookingEnabledOr423();
  if (locked) {
    return locked;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[uploads] Failed to parse multipart body", error);
    return NextResponse.json(
      { success: false as const, message: "Invalid multipart form data" },
      { status: 400 },
    );
  }

  const categoryRaw = formData.get("category");
  if (!isUploadCategory(categoryRaw)) {
    return NextResponse.json(
      { success: false as const, message: "Invalid or missing category" },
      { status: 400 },
    );
  }

  const files = formData.getAll("file").filter((entry) => entry instanceof File && entry.size > 0);
  if (files.length > 1) {
    return NextResponse.json(
      { success: false as const, message: "Only one file can be uploaded per request" },
      { status: 400 },
    );
  }

  const fileEntry = formData.get("file");
  const file = fileEntry instanceof File ? fileEntry : null;
  const bookingTempRef = readOptionalFormString(formData.get("bookingTempRef"));
  const folderHint = readOptionalFormString(formData.get("folderHint"));

  try {
    const uploaded = await uploadFile(file, {
      category: categoryRaw,
      bookingTempRef,
      folderHint,
    });

    return NextResponse.json({
      success: true as const,
      file: uploaded,
    });
  } catch (error) {
    if (error instanceof UploadRejectedError) {
      return NextResponse.json({ success: false as const, message: error.message }, { status: error.status });
    }

    console.error("[uploads] Storage failure", error);
    return NextResponse.json(
      { success: false as const, message: "Unable to store file right now. Please try again shortly." },
      { status: 500 },
    );
  }
}
