import { UploadRejectedError } from "./errors";
import { localUpload, type LocalUploadInput } from "./localUpload";
import type { UploadedFileResult, UploadFileOptions } from "./types";
import { validateUploadFile } from "./validators";

/**
 * Storage abstraction entry point. Today this validates and delegates to {@link localUpload};
 * later, swap the persistence call here (for example to S3) while keeping this function signature stable.
 */
export async function uploadFile(
  file: File | null | undefined,
  options: UploadFileOptions,
): Promise<UploadedFileResult> {
  const validation = validateUploadFile(file);
  if (!validation.ok) {
    throw new UploadRejectedError(validation.message, validation.status);
  }

  if (!(file instanceof File)) {
    throw new UploadRejectedError("No file uploaded", 400);
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    throw new UploadRejectedError("Unable to read uploaded file", 400);
  }

  if (buffer.length !== validation.file.size) {
    throw new UploadRejectedError("Uploaded file size mismatch", 400);
  }

  const payload: LocalUploadInput = {
    ...options,
    validated: validation.file,
    buffer,
  };

  return localUpload(payload);
}
