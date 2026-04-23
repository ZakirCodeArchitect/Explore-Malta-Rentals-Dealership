import { rm } from "node:fs/promises";
import { join } from "node:path";

import { getLocalBookingsUploadRoot } from "../src/lib/uploads/localUpload";
import { getUploadFolderKey, buildStoredFileName, extensionForMime } from "../src/lib/uploads/pathHelpers";
import { uploadFile } from "../src/lib/uploads/uploadService";
import { MAX_UPLOAD_BYTES, validateUploadFile } from "../src/lib/uploads/validators";
import { UploadRejectedError } from "../src/lib/uploads/errors";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const tinyPdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"
  const pdfFile = new File([tinyPdf], "license.pdf", { type: "application/pdf" });
  const pdfOk = validateUploadFile(pdfFile);
  assert(pdfOk.ok, "valid pdf should pass validation");
  assert(pdfOk.file.mimeType === "application/pdf", "pdf mime should normalize");

  const pngBytes = new Uint8Array(10);
  const pngFile = new File([pngBytes], "id.png", { type: "image/png" });
  const pngOk = validateUploadFile(pngFile);
  assert(pngOk.ok, "valid png should pass validation");

  const badFile = new File([pngBytes], "x.exe", { type: "application/octet-stream" });
  const bad = validateUploadFile(badFile);
  assert(!bad.ok && bad.message === "Invalid file type", "invalid type should fail");

  const huge = new Uint8Array(MAX_UPLOAD_BYTES + 1);
  const hugeFile = new File([huge], "big.bin", { type: "application/pdf" });
  const hugeResult = validateUploadFile(hugeFile);
  assert(!hugeResult.ok && hugeResult.status === 413, "oversized file should fail with 413");

  const empty = validateUploadFile(null);
  assert(!empty.ok && empty.message === "No file uploaded", "missing file should fail");

  const folderKey = getUploadFolderKey({ bookingTempRef: "my-safe-ref_1" });
  assert(folderKey === "my-safe-ref_1", "should honor sanitized bookingTempRef");

  const tempKey = getUploadFolderKey({});
  assert(/^temp-\d{8}-[0-9A-F]{4}$/.test(tempKey), `temp folder key should match pattern: ${tempKey}`);

  const ext = extensionForMime("image/jpeg");
  assert(ext === ".jpg", "jpeg maps to .jpg");
  const stored = buildStoredFileName("customer_license", ext!);
  assert(stored.startsWith("customer-license-") && stored.endsWith(".jpg"), `stored name: ${stored}`);

  const uploadRoot = getLocalBookingsUploadRoot();
  const uploaded = await uploadFile(pdfFile, {
    category: "customer_license",
    bookingTempRef: "verify-upload-phase",
  });

  assert(uploaded.relativePath.startsWith("uploads/bookings/verify-upload-phase/"), uploaded.relativePath);
  assert(uploaded.publicUrl === `/${uploaded.relativePath}`, uploaded.publicUrl);

  const absolutePath = join(uploadRoot, "verify-upload-phase", uploaded.fileName);
  await rm(absolutePath, { force: true });
  await rm(join(uploadRoot, "verify-upload-phase"), { recursive: true, force: true });

  try {
    await uploadFile(badFile, { category: "customer_license" });
    throw new Error("uploadFile should reject invalid mime");
  } catch (error) {
    assert(error instanceof UploadRejectedError, "invalid uploads should throw UploadRejectedError");
  }

  console.log("upload phase checks: ok");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
