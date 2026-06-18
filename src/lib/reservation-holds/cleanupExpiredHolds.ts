import type { Prisma } from "@/generated/prisma/index";
import { deleteOccupancyForHold } from "@/lib/vehicle-unit-occupancy";
import { releaseStaleHoldOccupancy } from "@/lib/reservation-holds/releaseStaleHoldOccupancy";
import { prisma } from "@/lib/prisma";

export type CleanupExpiredHoldsResult = {
  expiredHoldsFound: number;
  holdsExpired: number;
  occupancyRowsReleased: number;
  orphanOccupancyReleased: number;
  errors: Array<{ holdId?: string; message: string }>;
};

type CleanupDb = typeof prisma | Prisma.TransactionClient;

/**
 * Marks expired reservation holds and releases their unit occupancy.
 * Safe to run repeatedly (idempotent).
 */
export async function cleanupExpiredHolds(
  options: { db?: typeof prisma; now?: Date } = {},
): Promise<CleanupExpiredHoldsResult> {
  const db = options.db ?? prisma;
  const now = options.now ?? new Date();

  const result: CleanupExpiredHoldsResult = {
    expiredHoldsFound: 0,
    holdsExpired: 0,
    occupancyRowsReleased: 0,
    orphanOccupancyReleased: 0,
    errors: [],
  };

  const expiredActiveHolds = await db.reservationHold.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    select: { id: true },
    orderBy: { expiresAt: "asc" },
  });

  result.expiredHoldsFound = expiredActiveHolds.length;

  for (const hold of expiredActiveHolds) {
    try {
      const expired = await expireSingleHold(db, hold.id, now);
      if (expired) {
        result.holdsExpired += 1;
        result.occupancyRowsReleased += 1;
      }
    } catch (error) {
      result.errors.push({
        holdId: hold.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  try {
    result.orphanOccupancyReleased = await releaseStaleHoldOccupancy(db, now);
  } catch (error) {
    result.errors.push({
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return result;
}

async function expireSingleHold(db: CleanupDb, holdId: string, now: Date): Promise<boolean> {
  if (db === prisma) {
    return prisma.$transaction((tx) => expireSingleHold(tx, holdId, now));
  }

  const updated = await db.reservationHold.updateMany({
    where: {
      id: holdId,
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    data: { status: "EXPIRED" },
  });

  if (updated.count === 0) {
    return false;
  }

  await deleteOccupancyForHold(db, holdId);
  return true;
}
