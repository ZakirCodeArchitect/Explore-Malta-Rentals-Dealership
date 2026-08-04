"use client";

/**
 * Remote URLs (S3 gallery images, etc.) are returned as-is so the browser
 * fetches them directly. Next.js Image Optimization aborts upstream fetches
 * after a hard-coded 7s timeout, which surfaces as 504s when S3/DNS is slow.
 *
 * Relative/public paths still go through `/_next/image`.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (/^https?:\/\//i.test(src)) {
    return src;
  }

  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality ?? 75),
  });
  return `/_next/image?${params.toString()}`;
}
