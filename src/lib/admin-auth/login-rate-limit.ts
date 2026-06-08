import { createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { getClientIpFromRequest } from "@/lib/admin-auth/client-ip";
import {
  ADMIN_LOGIN_ATTEMPT_STALE_MS,
  ADMIN_LOGIN_FAILURE_MAX_ATTEMPTS,
  ADMIN_LOGIN_FAILURE_WINDOW_MS,
  ADMIN_LOGIN_LOCKOUT_DURATION_MS,
} from "@/lib/admin-auth/constants";

const DEV_RATE_LIMIT_SECRET = "dev-admin-rate-limit-secret";

function getAdminRateLimitSecret(): string {
  const secret = process.env.ADMIN_RATE_LIMIT_SECRET?.trim();
  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_RATE_LIMIT_SECRET;
  }

  throw new Error("ADMIN_RATE_LIMIT_SECRET environment variable is not set");
}

export function normalizeAdminLoginEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashClientIpForRateLimit(ip: string): string {
  const secret = getAdminRateLimitSecret();
  return createHash("sha256").update(`${secret}:${ip}`, "utf8").digest("hex");
}

export function resolveAdminLoginIdentity(
  request: Request,
  email: string,
): {
  emailNormalized: string;
  ipAddressHash: string;
} {
  const emailNormalized = normalizeAdminLoginEmail(email);
  const ipAddressHash = hashClientIpForRateLimit(getClientIpFromRequest(request));

  return { emailNormalized, ipAddressHash };
}

export async function cleanupStaleAdminLoginLockouts(): Promise<void> {
  const cutoff = new Date(Date.now() - ADMIN_LOGIN_ATTEMPT_STALE_MS);
  await prisma.adminLoginLockout.deleteMany({
    where: { updatedAt: { lt: cutoff } },
  });
}

export async function isAdminLoginLocked(
  emailNormalized: string,
  ipAddressHash: string,
): Promise<boolean> {
  const row = await prisma.adminLoginLockout.findUnique({
    where: {
      emailNormalized_ipAddressHash: {
        emailNormalized,
        ipAddressHash,
      },
    },
    select: { lockedUntil: true },
  });

  if (!row?.lockedUntil) {
    return false;
  }

  return row.lockedUntil > new Date();
}

export async function recordAdminLoginFailure(
  emailNormalized: string,
  ipAddressHash: string,
): Promise<void> {
  const now = new Date();
  const existing = await prisma.adminLoginLockout.findUnique({
    where: {
      emailNormalized_ipAddressHash: {
        emailNormalized,
        ipAddressHash,
      },
    },
  });

  let failedCount = 1;
  let firstFailedAt = now;
  let lockedUntil: Date | null = null;

  if (existing) {
    const windowExpired =
      existing.firstFailedAt !== null &&
      now.getTime() - existing.firstFailedAt.getTime() > ADMIN_LOGIN_FAILURE_WINDOW_MS;
    const lockoutExpired =
      existing.lockedUntil !== null && existing.lockedUntil <= now;

    if (windowExpired || lockoutExpired) {
      failedCount = 1;
      firstFailedAt = now;
    } else {
      failedCount = existing.failedCount + 1;
      firstFailedAt = existing.firstFailedAt ?? now;
    }

    if (failedCount >= ADMIN_LOGIN_FAILURE_MAX_ATTEMPTS) {
      lockedUntil = new Date(now.getTime() + ADMIN_LOGIN_LOCKOUT_DURATION_MS);
    }
  }

  await prisma.adminLoginLockout.upsert({
    where: {
      emailNormalized_ipAddressHash: {
        emailNormalized,
        ipAddressHash,
      },
    },
    create: {
      emailNormalized,
      ipAddressHash,
      failedCount,
      firstFailedAt,
      lastFailedAt: now,
      lockedUntil,
    },
    update: {
      failedCount,
      firstFailedAt,
      lastFailedAt: now,
      lockedUntil,
    },
  });
}

export async function clearAdminLoginAttempts(
  emailNormalized: string,
  ipAddressHash: string,
): Promise<void> {
  await prisma.adminLoginLockout.deleteMany({
    where: {
      emailNormalized,
      ipAddressHash,
    },
  });
}
