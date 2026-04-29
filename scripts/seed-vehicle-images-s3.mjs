import "dotenv/config";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import pg from "pg";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const REQUIRED_ENV = [
  "DATABASE_URL",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_S3_BUCKET",
];

for (const name of REQUIRED_ENV) {
  if (!process.env[name] || !process.env[name].trim()) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const connectionString = process.env.DATABASE_URL;
const bucket = process.env.AWS_S3_BUCKET.trim();

const pool = new pg.Pool({ connectionString });
const s3 = new S3Client({
  region: process.env.AWS_REGION.trim(),
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
  },
});

const projectRoot = resolve(process.cwd());
const publicRoot = resolve(projectRoot, "public");

const imageMimeByExt = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

function sanitizeSegment(value) {
  return value
    .trim()
    .replace(/[/\\]+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildS3Key(vehicleSlug, sourceUrl, kind) {
  const safeSlug = sanitizeSegment(vehicleSlug) || "unknown-vehicle";
  const sourceName = sourceUrl.split("/").pop() || "image";
  const safeFileName = sanitizeSegment(sourceName) || "image";
  return `vehicles/${safeSlug}/${kind}/${randomUUID()}-${safeFileName}`;
}

function resolveLocalImagePath(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  if (!imageUrl.startsWith("/")) return null;
  return resolve(publicRoot, `.${imageUrl}`);
}

function detectContentType(imageUrl) {
  const ext = extname(imageUrl).toLowerCase();
  return imageMimeByExt[ext] ?? "application/octet-stream";
}

async function uploadLocalImageToS3(localPath, imageUrl, vehicleSlug, kind) {
  const fileBuffer = await readFile(localPath);
  const key = buildS3Key(vehicleSlug, imageUrl, kind);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: detectContentType(imageUrl),
    }),
  );

  return `https://${bucket}.s3.amazonaws.com/${key}`;
}

async function main() {
  const client = await pool.connect();
  const uploadedBySourcePath = new Map();
  let scanned = 0;
  let uploaded = 0;
  let skippedRemote = 0;
  let skippedMissing = 0;
  let updatedMain = 0;
  let updatedGallery = 0;

  try {
    const vehiclesResult = await client.query(
      `SELECT id, slug, "mainImageUrl" FROM "Vehicle" ORDER BY "displayOrder" ASC, slug ASC`,
    );

    for (const vehicle of vehiclesResult.rows) {
      if (vehicle.mainImageUrl) {
        scanned += 1;
        if (/^https?:\/\//i.test(vehicle.mainImageUrl)) {
          skippedRemote += 1;
        } else {
          const localPath = resolveLocalImagePath(vehicle.mainImageUrl);
          if (!localPath) {
            skippedMissing += 1;
          } else {
            try {
              let s3Url = uploadedBySourcePath.get(localPath);
              if (!s3Url) {
                s3Url = await uploadLocalImageToS3(localPath, vehicle.mainImageUrl, vehicle.slug, "main");
                uploadedBySourcePath.set(localPath, s3Url);
                uploaded += 1;
              }
              await client.query(
                `UPDATE "Vehicle" SET "mainImageUrl" = $1, "updatedAt" = NOW() WHERE id = $2`,
                [s3Url, vehicle.id],
              );
              updatedMain += 1;
            } catch (error) {
              skippedMissing += 1;
              console.warn(`[vehicle:${vehicle.slug}] Could not upload main image ${vehicle.mainImageUrl}`, error.message);
            }
          }
        }
      }

      const galleryResult = await client.query(
        `SELECT id, "imageUrl" FROM "VehicleImage" WHERE "vehicleId" = $1 ORDER BY "sortOrder" ASC, id ASC`,
        [vehicle.id],
      );

      for (const image of galleryResult.rows) {
        scanned += 1;
        if (/^https?:\/\//i.test(image.imageUrl)) {
          skippedRemote += 1;
          continue;
        }

        const localPath = resolveLocalImagePath(image.imageUrl);
        if (!localPath) {
          skippedMissing += 1;
          continue;
        }

        try {
          let s3Url = uploadedBySourcePath.get(localPath);
          if (!s3Url) {
            s3Url = await uploadLocalImageToS3(localPath, image.imageUrl, vehicle.slug, "gallery");
            uploadedBySourcePath.set(localPath, s3Url);
            uploaded += 1;
          }
          await client.query(`UPDATE "VehicleImage" SET "imageUrl" = $1 WHERE id = $2`, [s3Url, image.id]);
          updatedGallery += 1;
        } catch (error) {
          skippedMissing += 1;
          console.warn(`[vehicle:${vehicle.slug}] Could not upload gallery image ${image.imageUrl}`, error.message);
        }
      }
    }

    console.log("Vehicle image S3 seed complete.");
    console.log(`Scanned refs: ${scanned}`);
    console.log(`Uploaded files: ${uploaded}`);
    console.log(`Updated main URLs: ${updatedMain}`);
    console.log(`Updated gallery URLs: ${updatedGallery}`);
    console.log(`Skipped already-remote: ${skippedRemote}`);
    console.log(`Skipped missing/invalid local refs: ${skippedMissing}`);
  } finally {
    client.release();
  }
}

try {
  await main();
} catch (error) {
  console.error("Vehicle image S3 seed failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
