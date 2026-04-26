import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";

import { buildStoredFileName, extensionForMime, getUploadFolderKey } from "./pathHelpers";
import type { UploadedFileResult, UploadFileOptions } from "./types";
import type { ValidatedUploadFile } from "./validators";

export function getLocalBookingsUploadRoot(): string {
  return resolve(process.cwd(), "public", "uploads", "bookings");
}

function isPathInsideRoot(root: string, candidate: string): boolean {
  const resolvedRoot = resolve(root);
  const resolvedCandidate = resolve(candidate);
  const prefix = resolvedRoot.endsWith(sep) ? resolvedRoot : `${resolvedRoot}${sep}`;
  return resolvedCandidate === resolvedRoot || resolvedCandidate.startsWith(prefix);
}

export type LocalUploadInput = UploadFileOptions & {
  validated: ValidatedUploadFile;
  buffer: Buffer;
};

export async function localUpload(input: LocalUploadInput): Promise<UploadedFileResult> {
  const ext = extensionForMime(input.validated.mimeType);
  if (!ext) {
    throw new Error("Unsupported MIME type for storage");
  }

  const folderKey = getUploadFolderKey({
    bookingTempRef: input.bookingTempRef,
    folderHint: input.folderHint,
  });

  const fileName = buildStoredFileName(input.category, ext);
  const uploadRoot = getLocalBookingsUploadRoot();
  const directoryPath = join(uploadRoot, folderKey);
  const absoluteFilePath = join(directoryPath, fileName);

  if (!isPathInsideRoot(uploadRoot, directoryPath) || !isPathInsideRoot(uploadRoot, absoluteFilePath)) {
    throw new Error("Refusing to write outside uploads directory");
  }

  await mkdir(directoryPath, { recursive: true });
  await writeFile(absoluteFilePath, input.buffer);

  const relativePath = `uploads/bookings/${folderKey}/${fileName}`;
  const publicUrl = `/${relativePath}`;

  return {
    category: input.category,
    originalName: input.validated.originalName,
    mimeType: input.validated.mimeType,
    size: input.validated.size,
    fileName,
    relativePath,
    publicUrl,
  };
}
