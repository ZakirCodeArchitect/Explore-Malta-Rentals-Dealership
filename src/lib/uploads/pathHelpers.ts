import { randomBytes } from "node:crypto";
import { format } from "date-fns";

import type { UploadCategory } from "./types";

const SAFE_FOLDER_SEGMENT = /^[a-zA-Z0-9_-]{1,80}$/;
const MAX_FOLDER_KEY_LENGTH = 80;

function sanitizeFolderKeySegment(raw: string | undefined): string | null {
  if (typeof raw !== "string") {
    return null;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const collapsed = trimmed.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/-+/g, "-");
  const noTraversal = collapsed.replace(/\.\.+/g, "").replace(/[/\\]/g, "");
  const candidate = noTraversal.slice(0, MAX_FOLDER_KEY_LENGTH).replace(/^-+|-+$/g, "");

  if (!candidate || !SAFE_FOLDER_SEGMENT.test(candidate)) {
    return null;
  }

  return candidate;
}

export type UploadFolderKeyInput = {
  bookingTempRef?: string | undefined;
  folderHint?: string | undefined;
};

export function getUploadFolderKey(input: UploadFolderKeyInput): string {
  const fromRef = sanitizeFolderKeySegment(input.bookingTempRef);
  if (fromRef) {
    return fromRef;
  }

  const fromHint = sanitizeFolderKeySegment(input.folderHint);
  if (fromHint) {
    return fromHint;
  }

  const datePart = format(new Date(), "yyyyMMdd");
  const randomPart = randomBytes(2).toString("hex").toUpperCase();
  return `temp-${datePart}-${randomPart}`;
}

export function categoryToFilePrefix(category: UploadCategory): string {
  return category.replaceAll("_", "-");
}

export function extensionForMime(mimeType: string): string | null {
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "application/pdf":
      return ".pdf";
    default:
      return null;
  }
}

export function buildStoredFileName(category: UploadCategory, extension: string): string {
  const safeExt = extension.startsWith(".") ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
  const randomId = randomBytes(3).toString("hex");
  return `${categoryToFilePrefix(category)}-${randomId}${safeExt}`;
}
