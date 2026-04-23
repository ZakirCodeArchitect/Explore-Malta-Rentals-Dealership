import type { UploadApiResponse, UploadCategory } from "@/lib/uploads/types";

export type UploadBookingDocumentOk = {
  ok: true;
  relativePath: string;
  publicUrl: string;
  originalName: string;
};

export type UploadBookingDocumentErr = {
  ok: false;
  message: string;
};

export type UploadBookingDocumentResult = UploadBookingDocumentOk | UploadBookingDocumentErr;

export async function uploadBookingDocument(
  file: File,
  category: UploadCategory,
  bookingSessionId: string,
): Promise<UploadBookingDocumentResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  formData.append("bookingTempRef", bookingSessionId);

  let response: Response;
  try {
    response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[uploadBookingDocument] Network error", error);
    }
    return { ok: false, message: "Upload failed. Check your connection and try again." };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { ok: false, message: "Upload failed. Unexpected server response." };
  }

  const parsed = body as UploadApiResponse;
  if (!response.ok || !parsed || typeof parsed !== "object" || !("success" in parsed)) {
    return { ok: false, message: "Upload failed. Please try again." };
  }

  if (!parsed.success) {
    return { ok: false, message: parsed.message || "Upload failed. Please try again." };
  }

  return {
    ok: true,
    relativePath: parsed.file.relativePath,
    publicUrl: parsed.file.publicUrl,
    originalName: parsed.file.originalName,
  };
}
