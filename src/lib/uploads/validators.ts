import { UPLOAD_CATEGORIES, type UploadCategory } from "./types";

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
]);

export type ValidatedUploadFile = {
  mimeType: string;
  size: number;
  originalName: string;
};

export type ValidateUploadFileOk = {
  ok: true;
  file: ValidatedUploadFile;
};

export type ValidateUploadFileErr = {
  ok: false;
  message: string;
  status: 400 | 413;
};

export type ValidateUploadFileResult = ValidateUploadFileOk | ValidateUploadFileErr;

function normalizeMimeType(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isUploadCategory(value: unknown): value is UploadCategory {
  return typeof value === "string" && (UPLOAD_CATEGORIES as readonly string[]).includes(value);
}

export function validateUploadFile(file: File | null | undefined): ValidateUploadFileResult {
  if (!file || !(file instanceof File)) {
    return { ok: false, message: "No file uploaded", status: 400 };
  }

  if (file.size <= 0) {
    return { ok: false, message: "No file uploaded", status: 400 };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, message: "File is too large (max 2 MB)", status: 413 };
  }

  const mimeType = normalizeMimeType(file.type || "");
  if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
    return { ok: false, message: "Invalid file type", status: 400 };
  }

  return {
    ok: true,
    file: {
      mimeType,
      size: file.size,
      originalName: file.name || "upload",
    },
  };
}
