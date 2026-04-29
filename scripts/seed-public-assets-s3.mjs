import "dotenv/config";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";
import {
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const REQUIRED_ENV = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_S3_BUCKET"];
for (const name of REQUIRED_ENV) {
  if (!process.env[name] || !process.env[name].trim()) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const bucket = process.env.AWS_S3_BUCKET.trim();
const region = process.env.AWS_REGION.trim();
const publicRoot = resolve(process.cwd(), "public");
const manifestPath = resolve(process.cwd(), "public-asset-s3-manifest.json");
const excludedRoots = new Set(["uploads"]);
const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
  ".svg",
  ".mp4",
  ".webm",
  ".mov",
]);

const mimeByExt = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
  },
});

function sanitizeSegment(value) {
  return value
    .replace(/[/\\]+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function canonicalizeRelPath(relPath) {
  const normalized = relPath.replaceAll("\\", "/");
  if (normalized.startsWith("about-page-images/")) {
    return normalized.replace("about-page-images/", "about-page-image/");
  }
  return normalized;
}

async function listFilesRecursively(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absPath = resolve(dir, entry.name);
    const relFromPublic = relative(publicRoot, absPath).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      const rootSegment = relFromPublic.split("/")[0] || entry.name;
      if (excludedRoots.has(rootSegment)) {
        continue;
      }
      files.push(...(await listFilesRecursively(absPath)));
    } else {
      files.push(absPath);
    }
  }
  return files;
}

async function loadExistingManifest() {
  try {
    const raw = await readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.assets || typeof parsed.assets !== "object") {
      return {};
    }
    return parsed.assets;
  } catch {
    return {};
  }
}

async function objectExists(key) {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

async function deletePrefix(prefix) {
  let continuationToken = undefined;
  let deleted = 0;
  do {
    const listed = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    const keys = (listed.Contents ?? []).map((obj) => obj.Key).filter(Boolean);
    if (keys.length > 0) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: keys.map((Key) => ({ Key })),
            Quiet: true,
          },
        }),
      );
      deleted += keys.length;
    }
    continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
  } while (continuationToken);
  return deleted;
}

async function main() {
  const existingManifest = await loadExistingManifest();
  const absFiles = await listFilesRecursively(publicRoot);
  const mediaFiles = absFiles.filter((absPath) => allowedExtensions.has(extname(absPath).toLowerCase()));
  const nextManifestAssets = {};
  let uploaded = 0;
  let reused = 0;
  let skippedExistingObject = 0;

  const removedLegacyCount = await deletePrefix("website-assets/about-page-images/");

  for (const absPath of mediaFiles) {
    const relPath = relative(publicRoot, absPath).replaceAll("\\", "/");
    const canonicalRelPath = canonicalizeRelPath(relPath);
    const publicPath = `/${relPath}`;
    const ext = extname(canonicalRelPath).toLowerCase();
    const existingUrl = existingManifest[publicPath];
    if (
      typeof existingUrl === "string" &&
      existingUrl.startsWith(`https://${bucket}.s3.amazonaws.com/`) &&
      existingUrl.includes(`/website-assets/`)
    ) {
      nextManifestAssets[publicPath] = existingUrl;
      reused += 1;
      continue;
    }

    const body = await readFile(absPath);
    const relSegments = canonicalRelPath.split("/").map((segment) => sanitizeSegment(segment));
    const key = ["website-assets", ...relSegments].join("/");
    const exists = await objectExists(key);
    if (!exists) {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: mimeByExt[ext] ?? "application/octet-stream",
        }),
      );
      uploaded += 1;
    } else {
      skippedExistingObject += 1;
    }
    nextManifestAssets[publicPath] = `https://${bucket}.s3.amazonaws.com/${key}`;
  }

  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        bucket,
        totalAssets: Object.keys(nextManifestAssets).length,
        assets: nextManifestAssets,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  console.log("Public assets S3 seed complete.");
  console.log(`Total media files: ${mediaFiles.length}`);
  console.log(`Uploaded now: ${uploaded}`);
  console.log(`Reused manifest URLs: ${reused}`);
  console.log(`Skipped existing S3 objects: ${skippedExistingObject}`);
  console.log(`Removed legacy objects (about-page-images): ${removedLegacyCount}`);
  console.log(`Manifest: ${manifestPath}`);
}

try {
  await main();
} catch (error) {
  console.error("Public assets S3 seed failed:", error);
  process.exitCode = 1;
}
