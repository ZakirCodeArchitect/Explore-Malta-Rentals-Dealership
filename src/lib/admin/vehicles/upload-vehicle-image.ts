import { uploadToS3ByKey } from "@/lib/s3";
import { UploadRejectedError } from "@/lib/uploads/errors";
import { validateUploadFile } from "@/lib/uploads/validators";

const VEHICLE_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .replace(/[/\\]+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeFileName(fileName: string): string {
  const normalized = fileName.trim().replace(/[/\\]/g, "-");
  const safe = normalized.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return safe || "upload";
}

function validateVehicleImage(file: File | null | undefined) {
  const base = validateUploadFile(file);
  if (!base.ok) {
    return base;
  }

  if (!VEHICLE_IMAGE_MIME_TYPES.has(base.file.mimeType)) {
    return { ok: false as const, message: "Only JPEG, PNG, and WebP images are allowed", status: 400 as const };
  }

  return base;
}

export async function uploadAdminVehicleImage(
  file: File | null | undefined,
  vehicleSlug: string,
): Promise<{ publicUrl: string; relativePath: string }> {
  const validation = validateVehicleImage(file);
  if (!validation.ok) {
    throw new UploadRejectedError(validation.message, validation.status);
  }

  if (!(file instanceof File)) {
    throw new UploadRejectedError("No file uploaded", 400);
  }

  const safeSlug = sanitizeSegment(vehicleSlug) || "vehicle";
  const objectKey = [
    "vehicles",
    safeSlug,
    "gallery",
    `${crypto.randomUUID()}-${sanitizeFileName(file.name || "upload")}`,
  ].join("/");

  const publicUrl = await uploadToS3ByKey(file, objectKey);
  const marker = ".amazonaws.com/";
  const markerIndex = publicUrl.indexOf(marker);
  const relativePath = markerIndex === -1 ? publicUrl : publicUrl.slice(markerIndex + marker.length);

  return { publicUrl, relativePath };
}
