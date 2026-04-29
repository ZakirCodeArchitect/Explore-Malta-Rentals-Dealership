import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const ALLOWED_UPLOAD_FOLDERS = new Set(["vehicles", "documents", "users"]);

function requiredEnv(name: "AWS_ACCESS_KEY_ID" | "AWS_SECRET_ACCESS_KEY" | "AWS_REGION" | "AWS_S3_BUCKET"): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function sanitizeFileName(fileName: string): string {
  const normalized = fileName.trim().replace(/[/\\]/g, "-");
  const safe = normalized.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return safe || "upload";
}

function normalizeFolder(folder: string): string {
  const candidate = folder.trim().toLowerCase();
  if (!ALLOWED_UPLOAD_FOLDERS.has(candidate)) {
    throw new Error(`Invalid upload folder: ${folder}`);
  }
  return candidate;
}

function normalizeKeySegment(value: string): string {
  return value
    .trim()
    .replace(/[/\\]+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let cachedClient: S3Client | null = null;

function getS3Config() {
  return {
    region: requiredEnv("AWS_REGION"),
    bucket: requiredEnv("AWS_S3_BUCKET"),
    accessKeyId: requiredEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("AWS_SECRET_ACCESS_KEY"),
  };
}

function getClient(): S3Client {
  if (cachedClient) {
    return cachedClient;
  }

  const config = getS3Config();
  cachedClient = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedClient;
}

export async function uploadToS3(file: File, folder: string): Promise<string> {
  if (!(file instanceof File) || file.size <= 0) {
    throw new Error("No file uploaded");
  }

  const normalizedFolder = normalizeFolder(folder);
  const objectName = `${crypto.randomUUID()}-${sanitizeFileName(file.name || "upload")}`;
  const key = `${normalizedFolder}/${objectName}`;
  return uploadToS3ByKey(file, key);
}

export async function uploadToS3ByKey(file: File, key: string): Promise<string> {
  if (!(file instanceof File) || file.size <= 0) {
    throw new Error("No file uploaded");
  }

  const normalizedKey = key
    .split("/")
    .map((segment) => normalizeKeySegment(segment))
    .filter(Boolean)
    .join("/");
  if (!normalizedKey) {
    throw new Error("Invalid object key");
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const { bucket } = getS3Config();
  const client = getClient();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: normalizedKey,
      Body: fileBuffer,
      ContentType: file.type || "application/octet-stream",
    }),
  );

  return `https://${bucket}.s3.amazonaws.com/${normalizedKey}`;
}
