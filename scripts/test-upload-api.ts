/**
 * Integration tests for POST /api/uploads.
 *
 * Prerequisites: dev or production server running (default http://localhost:3000).
 * Put sample documents in `TestFiles/` at the repo root (at least one `.pdf`).
 * Successful uploads are checked on disk under `public/` and again via `GET` on `publicUrl`.
 *
 *   npm run dev
 *   npm run test:upload-api
 *
 * Optional:
 *   UPLOAD_TEST_BASE_URL=http://127.0.0.1:3000 npm run test:upload-api
 *
 * By default, successful uploads are deleted after checks so the tree stays clean.
 * To leave files on disk for inspection:
 *   UPLOAD_TEST_KEEP_FILES=1 npm run test:upload-api
 * Files live under `public/uploads/bookings/` (gitignored — your editor may hide that folder).
 */

import { readdir, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

import { MAX_UPLOAD_BYTES } from "../src/lib/uploads/validators";

const BASE_URL = (process.env.UPLOAD_TEST_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const KEEP_UPLOAD_FILES =
  process.env.UPLOAD_TEST_KEEP_FILES === "1" || process.env.UPLOAD_TEST_KEEP_FILES?.toLowerCase() === "true";

function absoluteFromRelativePath(relativePath: string): string {
  return resolve(process.cwd(), "public", ...relativePath.split(/[/\\]/));
}

type UploadSuccessBody = {
  success: true;
  file: {
    category: string;
    originalName: string;
    mimeType: string;
    size: number;
    fileName: string;
    relativePath: string;
    publicUrl: string;
  };
};

type UploadErrorBody = {
  success: false;
  message: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function postUpload(form: FormData): Promise<Response> {
  return fetch(`${BASE_URL}/api/uploads`, {
    method: "POST",
    body: form,
  });
}

async function cleanupPublicRelative(relativePath: string): Promise<void> {
  const abs = join(process.cwd(), "public", relativePath);
  await rm(abs, { force: true });
}

async function cleanupFolderFromRelativePath(relativePath: string): Promise<void> {
  const parts = relativePath.split("/").filter(Boolean);
  if (parts.length < 3 || parts[0] !== "uploads" || parts[1] !== "bookings") {
    return;
  }
  const folderKey = parts[2];
  const dir = join(process.cwd(), "public", "uploads", "bookings", folderKey);
  await rm(dir, { recursive: true, force: true });
}

/** Confirms the API response path points to a real file and matches bytes; then that Next serves it over HTTP. */
async function verifyPersistedUploadAndServed(
  fileMeta: UploadSuccessBody["file"],
  source: Uint8Array,
  label: string,
): Promise<void> {
  const abs = absoluteFromRelativePath(fileMeta.relativePath);
  let stored: Buffer;
  try {
    stored = await readFile(abs);
  } catch (cause) {
    throw new Error(
      `${label}: expected file on disk at ${abs} (from relativePath). Is the dev server using the same project directory?`,
      { cause },
    );
  }

  assert(
    stored.length === source.length,
    `${label}: on-disk size ${stored.length} vs uploaded source ${source.length} (${abs})`,
  );
  assert(Buffer.from(source).equals(stored), `${label}: on-disk bytes do not match what was sent (${abs})`);

  const url = `${BASE_URL}${fileMeta.publicUrl}`;
  const res = await fetch(url);
  assert(res.ok, `${label}: GET ${fileMeta.publicUrl} should return 200, got ${res.status}`);
  const served = Buffer.from(await res.arrayBuffer());
  assert(
    served.length === source.length,
    `${label}: HTTP body length ${served.length} vs source ${source.length}`,
  );
  assert(served.equals(stored), `${label}: bytes served over HTTP should match on-disk file`);

  console.log(`  ${label}: file on disk + served OK → ${fileMeta.relativePath}`);
  console.log(`      ${abs}`);
}

async function cleanupUploadUnlessKept(relativePath: string): Promise<void> {
  if (KEEP_UPLOAD_FILES) {
    return;
  }
  await cleanupPublicRelative(relativePath);
  await cleanupFolderFromRelativePath(relativePath);
}

async function ensureServerReachable(): Promise<void> {
  try {
    await fetch(BASE_URL, { method: "GET" });
  } catch {
    throw new Error(
      `Cannot reach ${BASE_URL}. Start the app first (e.g. npm run dev), then run this script again.`,
    );
  }
}

const TEST_FILES_DIR = join(process.cwd(), "TestFiles");

/** 1×1 transparent PNG — only used when `TestFiles/` has no `.png` / `.jpg`. */
const MINIMAL_PNG = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  ),
);

type LoadedTestFile = { diskName: string; data: Uint8Array; mimeType: string };

async function loadFirstTestFileByExtension(
  extensions: readonly string[],
  mimeForExt: (ext: string) => string,
): Promise<LoadedTestFile | null> {
  let names: string[];
  try {
    names = await readdir(TEST_FILES_DIR);
  } catch {
    return null;
  }

  const lowerExts = extensions.map((e) => e.toLowerCase());
  const match = names.find((name) => {
    const lower = name.toLowerCase();
    return lowerExts.some((ext) => lower.endsWith(ext));
  });

  if (!match) {
    return null;
  }

  const ext = match.slice(match.lastIndexOf(".")).toLowerCase();
  const buf = await readFile(join(TEST_FILES_DIR, match));
  return { diskName: match, data: new Uint8Array(buf), mimeType: mimeForExt(ext) };
}

async function requireTestPdf(): Promise<LoadedTestFile> {
  const pdf = await loadFirstTestFileByExtension([".pdf"], () => "application/pdf");
  if (!pdf) {
    throw new Error(
      `No .pdf found in ${TEST_FILES_DIR}. Add a PDF there (e.g. your booking form sample) and run again.`,
    );
  }
  return pdf;
}

async function loadTestImageForPngCase(): Promise<LoadedTestFile> {
  const png = await loadFirstTestFileByExtension([".png"], () => "image/png");
  if (png) {
    return png;
  }

  const jpeg = await loadFirstTestFileByExtension([".jpg", ".jpeg"], () => "image/jpeg");
  if (jpeg) {
    return jpeg;
  }

  return {
    diskName: "minimal.png",
    data: MINIMAL_PNG,
    mimeType: "image/png",
  };
}

async function main() {
  await ensureServerReachable();

  const testPdf = await requireTestPdf();
  const testImage = await loadTestImageForPngCase();
  const invalidMimeBytes = testPdf.data.slice(0, Math.min(64, testPdf.data.length));

  // A) Valid PDF
  {
    const form = new FormData();
    form.set("category", "customer_license");
    form.set("file", new File([testPdf.data], testPdf.diskName, { type: testPdf.mimeType }));
    form.set("bookingTempRef", "script-test-uploads");
    const res = await postUpload(form);
    const body = (await res.json()) as UploadSuccessBody | UploadErrorBody;
    assert(res.ok && body.success === true, `A) valid PDF: expected 200 + success, got ${res.status} ${JSON.stringify(body)}`);
    assert(body.success && body.file.mimeType === "application/pdf", "A) expected application/pdf");
    assert(body.success && body.file.size === testPdf.data.length, "A) size should match source file");
    assert(body.success && body.file.relativePath.startsWith("uploads/bookings/script-test-uploads/"), body.success ? body.file.relativePath : "");
    assert(body.success && body.file.publicUrl === `/${body.file.relativePath}`, "A) publicUrl should match relativePath");
    assert(body.success, "A) narrowing");
    await verifyPersistedUploadAndServed(body.file, testPdf.data, "A) PDF");
    await cleanupUploadUnlessKept(body.file.relativePath);
  }

  // B) Valid image (PNG/JPEG from TestFiles/, or minimal PNG fallback)
  {
    const form = new FormData();
    form.set("category", "customer_passport");
    form.set("file", new File([testImage.data], testImage.diskName, { type: testImage.mimeType }));
    const res = await postUpload(form);
    const body = (await res.json()) as UploadSuccessBody | UploadErrorBody;
    assert(res.ok && body.success === true, `B) valid image: expected 200, got ${res.status} ${JSON.stringify(body)}`);
    assert(body.success && body.file.mimeType === testImage.mimeType, "B) MIME should match uploaded image");
    assert(body.success && body.file.size === testImage.data.length, "B) size should match source bytes");
    const expectedExt = testImage.mimeType === "image/png" ? ".png" : ".jpg";
    assert(body.success && body.file.fileName.endsWith(expectedExt), body.success ? body.file.fileName : "");
    assert(body.success, "B) narrowing");
    await verifyPersistedUploadAndServed(body.file, testImage.data, "B) image");
    await cleanupUploadUnlessKept(body.file.relativePath);
  }

  // C) Invalid MIME (real bytes, wrong declared type)
  {
    const form = new FormData();
    form.set("category", "customer_license");
    form.set(
      "file",
      new File([invalidMimeBytes], "fake.bin", { type: "application/octet-stream" }),
    );
    const res = await postUpload(form);
    const body = (await res.json()) as UploadErrorBody;
    assert(res.status === 400 && body.success === false && body.message === "Invalid file type", `C) invalid type: ${res.status} ${JSON.stringify(body)}`);
  }

  // D) Oversized (client sends declared PDF type; server rejects by size)
  {
    const huge = new Uint8Array(MAX_UPLOAD_BYTES + 1);
    const form = new FormData();
    form.set("category", "customer_license");
    form.set("file", new File([huge], "big.pdf", { type: "application/pdf" }));
    const res = await postUpload(form);
    const body = (await res.json()) as UploadErrorBody;
    assert(
      (res.status === 413 || res.status === 400) && body.success === false,
      `D) oversized: expected 413 or 400, got ${res.status} ${JSON.stringify(body)}`,
    );
    assert(
      typeof body.message === "string" && body.message.length > 0,
      "D) expected error message",
    );
  }

  // E) Missing / invalid category
  {
    const form = new FormData();
    form.set("file", new File([testPdf.data], testPdf.diskName, { type: testPdf.mimeType }));
    const res = await postUpload(form);
    const body = (await res.json()) as UploadErrorBody;
    assert(res.status === 400 && body.success === false, `E1) missing category: ${res.status}`);
    assert(body.message === "Invalid or missing category", body.message);
  }
  {
    const form = new FormData();
    form.set("category", "not_a_real_category");
    form.set("file", new File([testPdf.data], testPdf.diskName, { type: testPdf.mimeType }));
    const res = await postUpload(form);
    const body = (await res.json()) as UploadErrorBody;
    assert(res.status === 400 && body.success === false, `E2) invalid category: ${res.status}`);
  }

  // F) Missing file
  {
    const form = new FormData();
    form.set("category", "additional_driver_license");
    const res = await postUpload(form);
    const body = (await res.json()) as UploadErrorBody;
    assert(res.status === 400 && body.success === false, `F) missing file: ${res.status}`);
    assert(body.message === "No file uploaded", body.message);
  }

  console.log(`POST /api/uploads integration tests passed (${BASE_URL}) — uploads verified on disk and over HTTP`);
  if (KEEP_UPLOAD_FILES) {
    console.log(
      `Kept files under ${resolve(process.cwd(), "public", "uploads", "bookings")} (UPLOAD_TEST_KEEP_FILES is set).`,
    );
  } else {
    console.log(
      "Uploads from tests A/B were removed after verification. Re-run with UPLOAD_TEST_KEEP_FILES=1 to keep them, or upload via the app and open public/uploads/bookings/ in Explorer.",
    );
    console.log("That folder is gitignored — enable “show excluded/ignored files” in your editor if you do not see it.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
